package fleet.queue;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.jms.Connection;
import javax.jms.ConnectionFactory;
import javax.jms.JMSException;

/*
 * Manager all active connections to queue
 */
public class QueueConnectionManager {
	
	@Resource
	private QueueConnectionFactoryProvider factoryProvider;
	
	private ConnectionFactory connectionFactory;
	
	private final Map<String, Connection> openedConnections;
	
	public QueueConnectionManager(){
		openedConnections = new HashMap<String, Connection>();
		init();
	}
	
	private void init(){
		connectionFactory = factoryProvider.getConnectionFactory();
	}
	
	public Connection getConnection(String queueName) throws JMSException{
		if(openedConnections.containsKey(queueName)){
			return openedConnections.get(queueName);
		}else{
			Connection connection = connectionFactory.createConnection();
			synchronized (openedConnections) {
				if(!openedConnections.containsKey(queueName)){
					openedConnections.put(queueName, connection);
				}
			}
			
			return connection;
		}
	}
	
	public void close() throws JMSException{
		for (Connection conn : openedConnections.values()) {
			conn.close();
		}
	}
}
