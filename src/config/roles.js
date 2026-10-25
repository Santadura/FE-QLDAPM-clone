
export const ROLES = {
  TEACHER: {
    key: 'TEACHER',
    label: 'Giáo viên',
    shortLabel: 'GV',
    color: '#3B82F6',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Lịch của tôi',
        items: [
          { label: 'Đăng ký lịch rảnh', path: '/availability/register', icon: 'CalendarPlus' },
          // { label: 'Cập nhật lịch rảnh', path: '/availability/update', icon: 'CalendarClock' },
          { label: 'Lịch dạy', path: '/teaching-schedule', icon: 'CalendarDays', meta: { page: 'my-schedule', roleKey: 'TEACHER' } },
        ],
      },
      {
        title: 'Lớp phụ trách',
        items: [
          { label: 'Lớp được phân công', path: '/my-classes', icon: 'School' },
          { label: 'Danh sách học viên', path: '/students', icon: 'Users' },
        ],
      },
      {
        title: 'Giảng dạy',
        items: [
          // { label: 'Giao bài tập', path: '/assignments', icon: 'FileEdit' },
          // { label: 'Giao bài kiểm tra', path: '/tests', icon: 'ClipboardList' },
          // { label: 'Chấm điểm', path: '/grading', icon: 'CheckSquare' },
          // { label: 'Đánh giá học viên', path: '/student-reviews', icon: 'Star' },
          // { label: 'Theo dõi kết quả lớp', path: '/class-results', icon: 'BarChart3' },
{ label: 'Xem công lương', path: '/monitor/payroll', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'teacher' } },        ],
      },
    ],
  },

  TC: {
    key: 'TC',
    label: 'Teaching Coordinator',
    shortLabel: 'TC',
    color: '#8B5CF6',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Quản lý Giáo viên',
        items: [
          { label: 'Teachers', path: '/teachers', icon: 'Users' },
          // { label: 'Hồ sơ Giáo viên', path: '/teachers/profiles', icon: 'IdCard' },
        ],
      },
      {
        title: 'Vận hành giảng dạy',
        items: [
          {
            label: 'Lịch rảnh & Phân công',
            path: '/assign-teacher',
            icon: 'CalendarCheck2',
            meta: { page: 'teacher-assignment' },
          },
          { label: 'Điều chỉnh lịch dạy', path: '/schedule/adjust', icon: 'CalendarClock' },
          { label: 'Theo dõi lịch giảng dạy', path: '/schedule/overview', icon: 'CalendarDays' },
        ],
      },
      {
        title: 'Công lương',
        items: [
          // { label: 'Khối lượng giảng dạy', path: '/workload', icon: 'Gauge' },
{ label: 'Quản lý công lương GV', path: '/payroll', icon: 'Gauge', meta: { page: 'payroll', permission: 'manage', scope: 'teacher' } },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'teacher' } },
        ],
      },
    ],
  },

  CM: {
    key: 'CM',
    label: 'Center Management',
    shortLabel: 'CM',
    color: '#F59E0B',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Nhân sự vận hành',
        items: [
          { label: 'Sale / CS Staff', path: '/staff', icon: 'Users' },
        ],
      },
      {
        title: 'Vận hành ca làm',
        items: [
          {
            label: 'Lịch rảnh & Phân công Sale',
            path: '/assign-sale',
            icon: 'CalendarCheck2',
            meta: { page: 'staff-assignment', staffRole: 'SALE' },
          },
          {
            label: 'Lịch rảnh & Phân công CS',
            path: '/assign-cs',
            icon: 'CalendarCheck2',
            meta: { page: 'staff-assignment', staffRole: 'CS' },
          },
          { label: 'Điều chỉnh lịch làm việc', path: '/shift/adjust', icon: 'CalendarClock' },
          { label: 'Theo dõi lịch làm việc', path: '/shift/overview', icon: 'CalendarDays' },
        ],
      },
      {
        title: 'Công lương',
        items: [
          // { label: 'Khối lượng làm việc', path: '/workload', icon: 'Gauge' },
{ label: 'Công lương Sale', path: '/payroll/sale', icon: 'Gauge', meta: { page: 'payroll', permission: 'manage', scope: 'sale' } },
{ label: 'Công lương CS', path: '/payroll/cs', icon: 'Gauge', meta: { page: 'payroll', permission: 'manage', scope: 'cs' } },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'all' } },
        ],
      },
    ],
  },

  SALE: {
    key: 'SALE',
    label: 'Sale',
    shortLabel: 'SL',
    color: '#10B981',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Lịch của tôi',
        items: [
          { label: 'Đăng ký lịch rảnh', path: '/availability/register', icon: 'CalendarPlus' },
          // { label: 'Cập nhật lịch rảnh', path: '/availability/update', icon: 'CalendarClock' },
          { label: 'Xem lịch làm việc', path: '/availability/mine', icon: 'CalendarCheck', meta: { page: 'my-schedule', roleKey: 'SALE' } },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'sale' } },
        ],
      },
    ],
  },

  CS: {
    key: 'CS',
    label: 'CS',
    shortLabel: 'CS',
    color: '#EC4899',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Lịch của tôi',
        items: [
          { label: 'Đăng ký lịch rảnh', path: '/availability/register', icon: 'CalendarPlus' },
          // { label: 'Cập nhật lịch rảnh', path: '/availability/update', icon: 'CalendarClock' },
          { label: 'Lịch làm việc', path: '/my-shifts', icon: 'CalendarDays', meta: { page: 'my-schedule', roleKey: 'CS' } },
        ],
      },
      {
        title: 'Vận hành lớp',
        items: [
          { label: 'Quản lý lớp học', path: '/classes/update', icon: 'FileEdit' },
          // { label: 'Danh sách lớp', path: '/classes', icon: 'School' },
          // { label: 'Quản lý trạng thái lớp', path: '/classes/status', icon: 'ToggleLeft' },
          // { label: 'Hỗ trợ dữ liệu lớp', path: '/classes/support-data', icon: 'Database' },
        ],
      },
      {
        title: 'Công lương',
        items: [
          // { label: 'Khối lượng làm việc', path: '/workload', icon: 'Gauge' },
          // { label: 'Công lương CS', path: '/payroll/cs', icon: 'Gauge' },
{ label: 'Xem công lương', path: '/payroll/history', icon: 'Wallet', meta: { page: 'payroll', permission: 'view', scope: 'cs' } },        ],
      }
    ],
  },

  ADMIN: {
    key: 'ADMIN',
    label: 'Admin',
    shortLabel: 'AD',
    color: '#EF4444',
    sections: [
      {
        title: 'Chính',
        items: [{ label: 'Dashboard', path: '/', icon: 'LayoutDashboard' }],
      },
      {
        title: 'Quản lý nhân sự',
        items: [
          { label: 'Employees', path: '/employees', icon: 'Users' },
          { label: 'Tài khoản nhân viên', path: '/accounts', icon: 'Users' },
          { label: 'Vai trò & quyền hạn', path: '/permissions', icon: 'ShieldCheck' },
        ],
      },
      {
        title: 'Đào tạo',
        items: [
          // { label: 'Quản lý bài giảng', path: '/lessons', icon: 'BookOpen' },
          { label: 'Quản lý lớp học', path: '/classes', icon: 'School' },
          { label: 'Dữ liệu học viên', path: '/students', icon: 'GraduationCap' },
        ],
      },
      {
        title: 'Giám sát',
        items: [
          { label: 'Giám sát lịch phân công', path: '/monitor/schedules', icon: 'CalendarDays' },
{ label: 'Giám sát công lương', path: '/monitor/payroll', icon: 'Wallet', meta: { page: 'payroll', permission: 'approve', scope: 'all' } },          // { label: 'Dữ liệu hệ thống', path: '/system-data', icon: 'Database' },
{ label: 'Thống kê tổng quan', path: '/statistics', icon: 'BarChart3', meta: { page: 'statistics' } },        ],
      },
    ],
  },
}

export const ACCOUNT_ROLE_MAP = {
  Teacher: 'TEACHER',
  'Teaching Coordinator': 'TC',
  'Center Manager': 'CM',
  Sale: 'SALE',
  'CS Specialist': 'CS',
  Admin: 'ADMIN',
};

export const getRoleKeyFromAccountRole = (accountRole) => {
  return ACCOUNT_ROLE_MAP[accountRole] || null;
};

export const ROLE_LIST = Object.values(ROLES)
export const ACCOUNT_ROLE_OPTIONS = Object.keys(ACCOUNT_ROLE_MAP)
