package fleet.entity;

public class ClientRequestQueueMessage extends QueueMessage{

	private static final long serialVersionUID = 1L;

	private String requestId;
	
	private byte[] rawMessage;

	public String getRequestId() {
		return requestId;
	}

	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}

	public byte[] getRawMessage() {
		return rawMessage;
	}

	public void setRawMessage(byte[] rawMessage) {
		this.rawMessage = rawMessage;
	}
}
