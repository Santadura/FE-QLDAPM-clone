import {
  Navigate,
  useLocation,
} from 'react-router-dom';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';

export default function ProtectedRoute({
  children,
  allowedRoles,
}) {
  const location =
    useLocation();

  const { authUser } = useAccountData();
  const userRole = authUser?.roleKey;

  if (!authUser) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(userRole)
  ) {
    return (
      <Navigate
        to={userRole === 'USER' ? '/user/profile' : `/${userRole.toLowerCase()}`}
        replace
      />
    );
  }

  return children;
}
