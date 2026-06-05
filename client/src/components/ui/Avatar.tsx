import { useAuth } from "@/context/AuthContext";
import { createInitials } from "@/lib/helpers";
import { cn } from "@/lib/utils";

type AvatarProps = {
  className?: string;
  imageClassName?: string;
  initialsClassName?: string;
};

const Avatar = ({
  className,
  imageClassName,
  initialsClassName,
}: AvatarProps) => {
  const { user } = useAuth();
  return (
    <div className={cn("rounded-full size-8 overflow-hidden", className)}>
      {user?.picture ? (
        <img
          className={cn("w-full h-full object-cover", imageClassName)}
          src={user.picture}
          alt={user.name}
        />
      ) : (
        <div
          className={cn(
            "w-full h-full flex items-center justify-center text-white bg-zinc-300 font-bold",
            initialsClassName,
          )}
        >
          {createInitials(user?.name || "")}
        </div>
      )}
    </div>
  );
};

export default Avatar;
