from gremlin_python.driver.driver_remote_connection import DriverRemoteConnection
from gremlin_python.process.anonymous_traversal import traversal
from gremlin_python.process.graph_traversal import __
from backend.config import settings
from backend.logger import logger
import hashlib
import ssl


def get_neptune_connection():
    """Establishes a connection to the Neptune database."""
    endpoint = settings.neptune_endpoint
    port = 8182  # Default Neptune port
    connection_url = f"wss://{endpoint}:{port}/gremlin"

    # FOR LOCAL DEVELOPMENT WITH AN SSH TUNNEL ONLY
    # This disables SSL certificate hostname verification.
    # The 'localhost' hostname used for the tunnel will not match the
    # hostname in the Neptune certificate, so verification must be disabled.
    # DO NOT use this in a production environment.
    ssl_context = ssl.create_default_context()
    ssl_context.check_hostname = False
    ssl_context.verify_mode = ssl.CERT_NONE

    return DriverRemoteConnection(connection_url, 'g', ssl_context=ssl_context)


def add_graph_data(analysis_json: dict):
    """
    Adds entities and relationships from the analysis to the Neptune graph.
    Connection is created and closed within the function.
    """
    connection = None
    try:
        connection = get_neptune_connection()
        g = traversal().withRemote(connection)
        entities = analysis_json.get("entities", [])
        relationships = analysis_json.get("relationships", [])

        # Add vertices (entities) first, ensuring they are unique
        for entity in entities:
            name = entity.get("name")
            entity_type = entity.get("type")
            if not name or not entity_type:
                continue

            # Create a unique, deterministic ID for the vertex based on its name and type
            vertex_id = hashlib.sha256(f"{entity_type}:{name}".encode()).hexdigest()

            # Use coalesce to create the vertex if it doesn't exist.
            # __.unfold() is used to continue the traversal if the vertex exists.
            # __.addV() is used to create it if it does not.
            g.V().has('vertex_id', vertex_id).fold().coalesce(
                __.unfold(),
                __.addV(entity_type).property('vertex_id', vertex_id).property('name', name)
            ).next()

        logger.info(f"Upserted {len(entities)} vertices.")

        # Add edges (relationships)
        for rel in relationships:
            subject_name = rel.get("subject")
            predicate = rel.get("predicate")
            object_name = rel.get("object")

            if not subject_name or not predicate or not object_name:
                continue
            
            # Find the subject and object vertices safely
            subject_v_list = g.V().has('name', subject_name).toList()
            object_v_list = g.V().has('name', object_name).toList()

            if subject_v_list and object_v_list:
                subject_v = subject_v_list[0]
                object_v = object_v_list[0]

                # Explicitly check if the edge already exists.
                if not g.V(subject_v).outE(predicate).where(__.inV().is_(object_v)).hasNext():
                    # If it does not exist, create it.
                    # .iterate() is used for queries that have side-effects but no return value.
                    g.V(subject_v).addE(predicate).to(object_v).iterate()
                    logger.info(f"    - Edge CREATED: {subject_name} -[{predicate}]-> {object_name}")
                else:
                    logger.info(f"    - Edge EXISTS: {subject_name} -[{predicate}]-> {object_name}")
            else:
                logger.warning(f"Skipping edge creation: could not find vertices for relationship: {subject_name} -[{predicate}]-> {object_name}")
            
        logger.info(f"Finished processing {len(relationships)} edges.")

    except Exception as e:
        logger.error(f"Error adding data to Neptune: {e}")
    finally:
        if connection:
            connection.close()
        logger.info("Neptune graph update complete.")


def query_graph(query_text: str, user_id: str) -> list[str]:
    """
    Queries the Neptune graph. Connection is created and closed within the function.
    """
    connection = None
    try:
        connection = get_neptune_connection()
        g = traversal().withRemote(connection)
        
        # A more advanced implementation would use NLP to extract the core entity from the query.
        # For now, we assume the query is the entity name we're looking for.
        entity_name = query_text.strip().replace('?', '')
        
        logger.info(f"Querying graph for entity: '{entity_name}'")
        
        entity_vertex_list = g.V().has('name', entity_name).toList()
        
        if not entity_vertex_list:
            logger.warning(f"No vertex found for entity: {entity_name}")
            return []
            
        entity_vertex = entity_vertex_list[0]
        
        # Find all outgoing relationships (subject -> predicate -> object)
        paths = g.V(entity_vertex).outE().as_('edge').inV().as_('object').path().toList()
        
        results = []
        for path in paths:
            edge = path[1]
            obj_vertex = path[2]
            
            predicate = edge.label
            object_name = g.V(obj_vertex).values('name').next()
            
            results.append(f"{entity_name} {predicate.replace('_', ' ').lower()} {object_name}.")
            
        return results

    except Exception as e:
        logger.error(f"Error querying Neptune graph: {e}")
        return []
    finally:
        if connection:
            connection.close() 