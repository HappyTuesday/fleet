package fleet.queue;

import java.io.Serializable;
import java.util.Date;

/*
 * The base class for all queue-messages
 */
public class QueueMessage implements Serializable {

	private static final long serialVersionUID = 1L;

	private Date enqueDate;

	public Date getEnqueDate() {
		return enqueDate;
	}

	public void setEnqueDate(Date enqueDate) {
		this.enqueDate = enqueDate;
	}
}
