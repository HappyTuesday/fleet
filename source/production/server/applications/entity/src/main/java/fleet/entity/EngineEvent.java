package fleet.entity;

import java.io.Serializable;
import java.util.Date;

public class EngineEvent implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	private long sid;
	
	private Date recordTime;
	
	private double gpsHeading;
	
	private double gpsSpeed;
	
	private double latitude;
	
	private double longitude;
	
	private double engineSpeed;

	public long getSid() {
		return sid;
	}

	public void setSid(long sid) {
		this.sid = sid;
	}

	public Date getRecordTime() {
		return recordTime;
	}

	public void setRecordTime(Date recordTime) {
		this.recordTime = recordTime;
	}

	public double getGpsHeading() {
		return gpsHeading;
	}

	public void setGpsHeading(double gpsHeading) {
		this.gpsHeading = gpsHeading;
	}

	public double getGpsSpeed() {
		return gpsSpeed;
	}

	public void setGpsSpeed(double gpsSpeed) {
		this.gpsSpeed = gpsSpeed;
	}

	public double getLatitude() {
		return latitude;
	}

	public void setLatitude(double latitude) {
		this.latitude = latitude;
	}

	public double getLongitude() {
		return longitude;
	}

	public void setLongitude(double longitude) {
		this.longitude = longitude;
	}

	public double getEngineSpeed() {
		return engineSpeed;
	}

	public void setEngineSpeed(double engineSpeed) {
		this.engineSpeed = engineSpeed;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

}
