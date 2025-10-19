import { ArrowUp, ArrowUpDown, Trash2, Edit } from 'lucide-react';
import { RunningPost } from '../../types/posts';
import { formatRelativeTime, formatDateTime } from '../../utils/posts';
import { SoftCheckbox } from '../ui/SoftCheckbox';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { StatusPill } from '../ui/StatusPill';

type PostsTableProps = {
  items: RunningPost[];
  selectAll: boolean;
  onToggleSelectAll: () => void;
  onToggleSelectOne: (id: string) => void;
  onToggleItemVisibility: (id: string) => void;
  onDeletePost: (id: string) => void;
  onEditPost: (post: RunningPost) => void;
  onSort: (column: string) => void;
  onClickTodayComments?: (post: RunningPost) => void;
};

export function PostsTable({
  items,
  selectAll,
  onToggleSelectAll,
  onToggleSelectOne,
  onToggleItemVisibility,
  onDeletePost,
  onEditPost,
  onSort,
  onClickTodayComments,
}: PostsTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="text-left text-gray-300 bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/5">
            <th className="px-3 py-2">
              <SoftCheckbox
                checked={selectAll}
                onChange={onToggleSelectAll}
                label="Chọn tất cả"
              />
            </th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">STT</th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">Trạng thái</th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">Comment hôm nay</th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">
              <button
                onClick={() => onSort('title')}
                className="flex items-center gap-2 hover:text-white transition-colors w-full justify-start"
              >
                Tiêu đề
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">
              <button
                onClick={() => onSort('lastComment')}
                className="flex items-center gap-2 hover:text-white transition-colors w-full justify-start"
              >
                Comment gần đây
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">Thời gian</th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">
              <button
                onClick={() => onSort('status')}
                className="flex items-center gap-2 hover:text-white transition-colors w-full justify-start"
              >
                Trạng thái
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </th>
            <th className="px-3 py-2 tracking-wide text-xs text-gray-400">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td className="px-3 py-4 text-center text-gray-400" colSpan={9}>
                Chưa có dữ liệu
              </td>
            </tr>
          ) : (
            items.map((item, idx) => (
              <tr key={item.id} className="border-t border-white/10 hover:bg-white/10 transition-colors">
                <td className="px-3 py-3">
                  <SoftCheckbox
                    checked={!!item.selected}
                    onChange={() => onToggleSelectOne(item.id)}
                    label={`Chọn ${item.title}`}
                  />
                </td>
                <td className="px-3 py-3 text-gray-200">{idx + 1}</td>
                <td className="px-3 py-3">
                  <ToggleSwitch
                    checked={item.status === 'Đang chạy'}
                    onChange={() => onToggleItemVisibility(item.id)}
                    srLabel="Trạng thái"
                  />
                </td>
                <td className="px-3 py-3">
                  <button
                    onClick={() => onClickTodayComments && onClickTodayComments(item)}
                    className={
                      'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold border shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition-colors ' +
                      (item.commentCountToday > 0
                        ? 'text-emerald-300 bg-emerald-400/10 border-emerald-400/25 hover:bg-emerald-400/20'
                        : 'text-sky-300 bg-sky-400/10 border-sky-400/25 hover:bg-sky-400/20')
                    }
                    title="Xem comment hôm nay của bài viết này"
                  >
                    <ArrowUp className="w-4 h-4" />
                    <span className="tabular-nums tracking-wide">{item.commentCountToday}</span>
                  </button>
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col">
                    <span className="text-gray-100 font-medium truncate max-w-[420px]" title={item.title}>
                      {item.title}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-300 hover:text-blue-200 truncate max-w-[520px] underline decoration-blue-500/30 underline-offset-4 hover:decoration-blue-400/50"
                      title={item.url}
                    >
                      {item.url}
                    </a>
                  </div>
                </td>
                <td className="px-3 py-3 text-gray-300">{formatRelativeTime(item.lastCommentAt)}</td>
                <td className="px-3 py-3 text-gray-300 text-sm font-mono">
                  {formatDateTime(item.lastCommentAt)}
                </td>
                <td className="px-3 py-3">
                  <StatusPill status={item.status} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditPost(item)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="Chỉnh sửa bài viết"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeletePost(item.id)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Xóa bài viết"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
