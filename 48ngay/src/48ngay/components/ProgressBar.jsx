function ProgressBar({ completed, total, percentage }) {
  return (
    <section className="progress-wrap">
      <div className="progress-title-row">
        <h2>Tiến độ học tập</h2>
        <p>
          {completed}/{total} ngày đã hoàn thành
        </p>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={percentage}>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      <p className="progress-percent">{percentage}%</p>
    </section>
  )
}

export default ProgressBar
