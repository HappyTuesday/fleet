package fleet.queue;

public interface QueueSession {
	QueueConsumer createConsumer();
	
	QueueProducer createProducer();
	
	void commit();
}
