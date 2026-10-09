import React from 'react';

const formatStatus = (status) => {
  if (!status) return '';
  return status.replace('_', ' ');
};

export const StatusBadge = ({ status }) => {
  return (
    <span className={`badge badge-${status}`}>
      {formatStatus(status)}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const roleLabel = role?.replace('ROLE_', '');
  const badgeClass = `badge badge-role-${roleLabel?.toLowerCase()}`;
  return (
    <span className={badgeClass}>
      {roleLabel}
    </span>
  );
};
