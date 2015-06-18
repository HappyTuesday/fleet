package fleet.queue;

import javax.annotation.Resource;
import javax.jms.ConnectionFactory;

import org.apache.activemq.ActiveMQConnectionFactory;

public class QueueConnectionFactoryProvider {
	
	@Resource
	private QueueConfiguration configuration;
	
	public ConnectionFactory getConnectionFactory(){
		return new ActiveMQConnectionFactory(configuration.getUrl());
	}
}
