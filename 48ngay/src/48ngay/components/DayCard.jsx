import { Link } from 'react-router-dom'
import { LESSON_STATUS } from '../services/courseService'

const LABELS = {
  [LESSON_STATUS.NOT_STARTED]: 'Chưa học',
  [LESSON_STATUS.IN_PROGRESS]: 'Đang học',
  [LESSON_STATUS.COMPLETED]: 'Hoàn thành',
}

function DayCard({ day, title, status }) {
  const statusValue = status || LESSON_STATUS.NOT_STARTED

  return (
    <Link to={`/48ngay/lesson/${day}`} className="day-card">
      <p className="day-number">Day {day}</p>
      <h3>{title}</h3>
      <span className={`status-badge status-${statusValue}`}>{LABELS[statusValue]}</span>
    </Link>
  )
}

export default DayCard
