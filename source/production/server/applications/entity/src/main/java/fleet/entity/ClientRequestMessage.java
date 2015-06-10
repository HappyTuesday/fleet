package fleet.entity;

import java.io.Serializable;
import java.util.Date;

public class ClientRequestMessage implements Serializable {

	private static final long serialVersionUID = 1L;
	
	public enum MessageType{
		RealTimeRequest,
		UploadEvents
	}
	
	private String requestId;
	
	private Date requestTime;
	
	private long clientId;
	
	private byte[] messageBody;
	
	private MessageType messageType;

	public String getRequestId() {
		return requestId;
	}

	public void setRequestId(String requestId) {
		this.requestId = requestId;
	}

	public Date getRequestTime() {
		return requestTime;
	}

	public void setRequestTime(Date requestTime) {
		this.requestTime = requestTime;
	}

	public long getClientId() {
		return clientId;
	}

	public void setClientId(long clientId) {
		this.clientId = clientId;
	}

	public byte[] getMessageBody() {
		return messageBody;
	}

	public void setMessageBody(byte[] messageBody) {
		this.messageBody = messageBody;
	}

	public MessageType getMessageType() {
		return messageType;
	}

	public void setMessageType(MessageType messageType) {
		this.messageType = messageType;
	}

}
