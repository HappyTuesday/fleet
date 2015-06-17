package fleet.queue;

public interface QueueOperator {
	void sendMessage(Queue queue, QueueMessage message);
	
	QueueMessage receiveMessage(Queue queue);
}
