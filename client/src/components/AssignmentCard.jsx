import { Link } from "react-router-dom";
import { formatDate, timeUntil, isOverdue } from "../utils/formatDate";

export default function AssignmentCard({ assignment, submission }) {
  const overdue = isOverdue(assignment.dueDate);
  const graded = submission?.status === "graded";

  return (
    <Link to={`/assignment/${assignment._id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ background: graded ? "#E1F5EE" : overdue ? "#FCEBEB" : "#EEEDFE" }}>
          {graded ? "✅" : overdue ? "⚠️" : "📝"}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate" style={{ color: "#26215C" }}>
            {assignment.title}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: "#7F77DD" }}>
            Due: {formatDate(assignment.dueDate)}
          </p>
          {submission ? (
            graded ? (
              <span className="badge badge-green mt-1">
                Graded: {submission.grade}/{assignment.totalMarks}
              </span>
            ) : (
              <span className="badge badge-purple mt-1">Submitted</span>
            )
          ) : (
            <span className={`badge mt-1 ${overdue ? "badge-red" : "badge-amber"}`}>
              {timeUntil(assignment.dueDate)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
