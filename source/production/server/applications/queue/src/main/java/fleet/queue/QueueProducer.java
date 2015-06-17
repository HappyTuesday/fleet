package fleet.queue;

public interface QueueProducer {
	void sendMessage(QueueMessage message);
}
