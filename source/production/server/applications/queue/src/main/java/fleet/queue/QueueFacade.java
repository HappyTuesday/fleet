package fleet.queue;

import java.io.Serializable;

import javax.annotation.Resource;
import javax.jms.Destination;
import javax.jms.JMSException;
import javax.jms.MessageProducer;
import javax.jms.Session;

public class QueueFacade {
	
	@Resource
	private QueueConnectionManager connectionManager;
	
	public <T extends Serializable> void sendMessage(String queueName,T message) throws JMSException{
		Session session =  connectionManager.getConnection(queueName).createSession(false, 0);
		Destination des = session.createQueue(queueName);
		MessageProducer producer = session.createProducer(des);
		producer.send(session.createObjectMessage(message));
		session.commit();
		producer.close();
		session.close();
	}
	
	public <T> T receiveMessage(String queueName){
		// TODO: receive message
		return null;
	}
}
