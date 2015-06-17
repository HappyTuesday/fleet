package fleet.queue;

public interface QueueConnectionFactory {
	public QueueConnection getConnection(String url);
}
