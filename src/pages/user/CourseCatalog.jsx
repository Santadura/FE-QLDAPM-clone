import { useState } from 'react';
import { ArrowLeft, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import CourseCard from '../../components/user/CourseCard';
import { userCourses } from '../../data/userCourses';
import { useAccountData } from '../../features/accounts/hooks/useAccountData';
import { useDemoPurchases } from '../../features/user/useDemoPurchases';

const categories = ['Tất cả', ...new Set(userCourses.map((course) => course.category))];
const PAGE_SIZE = 8;

export default function CourseCatalog() {
  const [category, setCategory] = useState('Tất cả');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [page, setPage] = useState(1);
  const { authUser } = useAccountData();
  const purchases = useDemoPurchases(authUser?.roleKey === 'USER' ? authUser.username : null);
  const priceFrom = minPrice === '' ? 0 : Number(minPrice);
  const priceTo = maxPrice === '' ? Infinity : Number(maxPrice);
  const invalidPrice = [minPrice, maxPrice].some((value) => value !== '' && (!Number.isSafeInteger(Number(value)) || Number(value) < 0));
  const priceError = invalidPrice ? 'Vui lòng nhập học phí là số nguyên không âm.'
    : priceFrom > priceTo ? 'Giá từ phải nhỏ hơn hoặc bằng giá đến.' : '';
  const courses = userCourses.filter((course) => !priceError && (category === 'Tất cả' || course.category === category)
    && course.price >= priceFrom && course.price <= priceTo
    && `${course.title} ${course.description}`.toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleCourses = courses.slice(startIndex, startIndex + PAGE_SIZE);

  function handlePageChange(nextPage) {
    if (nextPage >= 1 && nextPage <= totalPages) setPage(nextPage);
  }

  function clearFilters() {
    setCategory('Tất cả');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setPage(1);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-[#173557]"><ArrowLeft size={14} />Về trang giới thiệu</Link>
      <section id="courses" aria-labelledby="courses-heading" className="pb-8 pt-4 sm:pb-10">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <h1 id="courses-heading" className="text-2xl font-bold tracking-tight text-[#173557] sm:text-3xl">Đăng ký khóa học</h1>
          <span className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-500">{userCourses.length} khóa học</span>
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex flex-wrap gap-2" aria-label="Lọc khóa học">
            {categories.map((item) => <Button key={item} variant={category === item ? 'primary' : 'secondary'} aria-pressed={category === item} onClick={() => { setCategory(item); setPage(1); }}>{item}</Button>)}
          </div>
          <div className="flex w-full flex-wrap items-end gap-3">
            <div className="relative w-full sm:w-60">
              <Search size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-2.5 text-slate-400" />
              <input type="search" aria-label="Tìm khóa học" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Tìm tên hoặc mô tả khóa học..."
                className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-xs text-slate-700 outline-none focus:border-[#173557] focus:ring-1 focus:ring-[#173557]" />
            </div>
            <div className="grid w-full gap-3 sm:w-[440px] sm:grid-cols-2">
              <label className="flex min-w-0 items-center gap-2 text-[11px] text-slate-500"><span className="shrink-0">Giá từ (VNĐ)</span>
                <input type="number" min="0" step="1" inputMode="numeric" value={minPrice} placeholder="Không giới hạn"
                  aria-invalid={Boolean(priceError)} aria-describedby={priceError ? 'price-filter-error' : undefined}
                  onChange={(event) => { setMinPrice(event.target.value); setPage(1); }}
                  className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#173557] focus:ring-1 focus:ring-[#173557]" />
              </label>
              <label className="flex min-w-0 items-center gap-2 text-[11px] text-slate-500"><span className="shrink-0">Đến (VNĐ)</span>
                <input type="number" min="0" step="1" inputMode="numeric" value={maxPrice} placeholder="Không giới hạn"
                  aria-invalid={Boolean(priceError)} aria-describedby={priceError ? 'price-filter-error' : undefined}
                  onChange={(event) => { setMaxPrice(event.target.value); setPage(1); }}
                  className="h-9 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-xs text-slate-700 outline-none focus:border-[#173557] focus:ring-1 focus:ring-[#173557]" />
              </label>
            </div>
            {(minPrice !== '' || maxPrice !== '') && <Button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1); }}>Xóa lọc giá</Button>}
          </div>
          {priceError && <p id="price-filter-error" role="alert" className="w-full text-xs text-red-600">{priceError}</p>}
        </div>
        <p className="mb-3 text-[11px] text-slate-500">Thông tin chương trình và học phí hiện là dữ liệu mẫu.</p>
        {courses.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{visibleCourses.map((course) => <CourseCard key={course.id} course={course} owned={purchases.some((purchase) => purchase.courseId === course.id)} />)}</div>
          : <div className="rounded-lg border border-slate-200 bg-white px-5 py-14 text-center"><Search size={28} className="mx-auto text-slate-300" /><h3 className="mt-4 text-base font-semibold text-slate-800">{priceError ? 'Khoảng giá chưa hợp lệ' : 'Chưa tìm thấy khóa học phù hợp'}</h3><p className="mb-5 mt-2 text-xs text-slate-500">{priceError ? 'Điều chỉnh khoảng giá để xem các khóa học phù hợp.' : 'Thử từ khóa khác hoặc xem lại tất cả khóa học.'}</p><Button onClick={clearFilters}>Xóa bộ lọc</Button></div>}
        <Pagination page={currentPage} pageSize={PAGE_SIZE} total={courses.length} onPageChange={handlePageChange}
          label="Phân trang khóa học" previousLabel="Trang trước" nextLabel="Trang sau"
          summary={`Hiển thị ${courses.length ? startIndex + 1 : 0}–${startIndex + visibleCourses.length} trên ${courses.length} khóa học`}
          className="mt-4 rounded-b-lg border border-slate-200" />
      </section>
    </div>
  );
}
