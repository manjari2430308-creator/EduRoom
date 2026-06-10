import { Link } from "react-router-dom";

const COVERS = ["#CECBF6", "#AFA9EC", "#C0DD97", "#9FE1CB", "#F4C0D1", "#FAC775"];

export default function ClassCard({ classroom }) {
  const cover = classroom.coverColor || COVERS[0];

  return (
    <Link to={`/classroom/${classroom._id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer p-0 overflow-hidden">
        <div className="flex items-end px-4 pb-3 pt-10 relative" style={{ background: cover, minHeight: 80 }}>
          <div className="absolute top-3 right-3 text-xs font-mono px-2 py-0.5 rounded-lg"
            style={{ background: "rgba(255,255,255,0.45)", color: "#26215C" }}>
            {classroom.joinCode}
          </div>
          <h3 className="font-medium text-sm leading-tight" style={{ color: "#26215C" }}>
            {classroom.title}
          </h3>
        </div>
        <div className="px-4 py-3">
          <p className="text-xs" style={{ color: "#7F77DD" }}>{classroom.subject}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs" style={{ color: "#AFA9EC" }}>
              {classroom.teacherId?.name || "Teacher"}
            </p>
            <span className="badge badge-purple text-xs">
              {classroom.students?.length || 0} students
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
