import { getInitials } from '../../utils/helpers';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-9 h-9 text-sm',
  lg: 'w-11 h-11 text-base',
  xl: 'w-14 h-14 text-xl',
};

/**
 * Avatar — shows image if `src` provided, otherwise initials with avatarColor
 */
const Avatar = ({ name = '', src, color = '#F97316', size = 'md', className = '', title }) => {
  const sizeClass = sizeMap[size] || sizeMap.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        title={title || name}
        className={`${sizeClass} rounded-full object-cover ring-2 ring-white dark:ring-gray-800 ${className}`}
      />
    );
  }

  return (
    <div
      title={title || name}
      className={`${sizeClass} rounded-full flex items-center justify-center font-semibold text-white
                  ring-2 ring-white dark:ring-gray-800 shrink-0 select-none ${className}`}
      style={{ backgroundColor: color }}
    >
      {getInitials(name)}
    </div>
  );
};

/** Group of avatars (stacked) */
export const AvatarGroup = ({ users = [], max = 3, size = 'sm' }) => {
  const visible = users.slice(0, max);
  const rest = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((u, i) => (
        <Avatar key={u._id || i} name={u.name} color={u.avatarColor} size={size} />
      ))}
      {rest > 0 && (
        <div
          className={`${sizeMap[size]} rounded-full bg-gray-200 dark:bg-gray-600 flex items-center
                      justify-center text-xs font-semibold text-gray-600 dark:text-gray-300
                      ring-2 ring-white dark:ring-gray-800`}
        >
          +{rest}
        </div>
      )}
    </div>
  );
};

export default Avatar;
