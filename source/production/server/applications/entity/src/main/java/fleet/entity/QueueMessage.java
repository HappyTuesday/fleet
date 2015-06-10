package fleet.entity;

import java.io.Serializable;
import java.util.Date;

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
