import { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory, type Category } from '../api/client';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#1769e8');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await createCategory({ name: name.trim(), description: description.trim(), color });
      setShowCreate(false);
      setName('');
      setDescription('');
      setColor('#1769e8');
      await load();
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleToggle = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { is_active: !cat.is_active });
      await load();
    } catch { /* ignore */ }
  };

  return (
    <Layout>
      <div className="space-y-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-100">分类管理</h1>
            <p className="text-surface-400 mt-1">管理工单分类标签</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="self-start xl:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            新增分类
          </Button>
        </div>

        <Card className="!p-0 overflow-hidden">
          {loading ? (
            <div className="space-y-0">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 border-b border-surface-700 animate-pulse bg-surface-800" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-surface-500">
              <p>暂无分类，点击右上角新增</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-900 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">颜色</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">名称</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">描述</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">状态</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">操作</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-surface-700">
                    <td className="px-5 py-3.5">
                      <div className="w-6 h-6 rounded-full" style={{ backgroundColor: cat.color }} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-surface-200 font-medium">{cat.name}</td>
                    <td className="px-5 py-3.5 text-sm text-surface-400">{cat.description || '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={cat.is_active ? 'success' : 'default'} dot>
                        {cat.is_active ? '启用' : '禁用'}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(cat)}
                      >
                        {cat.is_active ? '禁用' : '启用'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </Card>
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="新增分类">
        <div className="space-y-4">
          <Input label="分类名称" placeholder="如：技术支持" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="描述" placeholder="分类说明（可选）" value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">标签颜色</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border border-surface-600 cursor-pointer bg-transparent"
              />
              <span className="text-sm text-surface-400 font-mono">{color}</span>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleCreate} loading={submitting} disabled={!name.trim()} className="flex-1">
              创建分类
            </Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>取消</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
