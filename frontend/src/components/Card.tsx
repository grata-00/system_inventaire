
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Badge } from "./ui/badge";

interface CardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  color: string;
  badge?: string;
}

const Card = ({ title, description, icon: Icon, path, color, badge }: CardProps) => {
  return (
    <Link to={path}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer h-full">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-md ${color}`}>
            <Icon className="text-white h-6 w-6" />
          </div>
          {badge && (
            <Badge variant="destructive" className="h-6 w-6 flex items-center justify-center rounded-full p-0 text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );
};

export default Card;
