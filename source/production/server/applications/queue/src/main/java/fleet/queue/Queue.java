package fleet.queue;

import java.io.Serializable;

public class Queue implements Serializable {
	private static final long serialVersionUID = 1L;

	private String queueName;
	
	private String queueGroup;

	public String getQueueName() {
		return queueName;
	}

	public void setQueueName(String queueName) {
		this.queueName = queueName;
	}

	public String getQueueGroup() {
		return queueGroup;
	}

	public void setQueueGroup(String queueGroup) {
		this.queueGroup = queueGroup;
	}
}
