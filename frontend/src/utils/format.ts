export const formatSalary = (min?: number, max?: number): string => {
  if (!min && !max) return 'Competitive';
  
  const formatLakh = (val: number) => {
    if (val >= 100000) {
      return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`;
    }
    return `₹${val.toLocaleString('en-IN')}`;
  };

  if (min && max) {
    return `${formatLakh(min)} - ${formatLakh(max)} / yr`;
  }
  if (min) return `From ${formatLakh(min)} / yr`;
  return `Up to ${formatLakh(max!)} / yr`;
};

export const formatDate = (dateString?: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};
