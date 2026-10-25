import ManagementToolbar from '../ui/ManagementToolbar';
import { ACCOUNT_ROLE_OPTIONS } from '../../config/roles';

const roleOptions = ACCOUNT_ROLE_OPTIONS.map((role) => ({ value: role, label: role }));
const statusOptions = ['Active', 'Locked'].map((status) => ({ value: status, label: status }));

export default function AccountToolbar(props) {
  return <ManagementToolbar {...props} searchPlaceholder="Search accounts..." roleOptions={roleOptions}
    statusOptions={statusOptions} allRolesValue="All Roles" allStatusValue="All Status" addLabel="Add Account" />;
}
