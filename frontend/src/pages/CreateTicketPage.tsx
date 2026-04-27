import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, fetchCategories, type Category } from '../api/client';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

const priorityOptions = [
  { value: 'low', label: '低 — 不影响工作' },
  { value: 'medium', label: '中 — 有一定影响' },
  { value: 'high', label: '高 — 严重影响' },
  { value: 'urgent', label: '紧急 — 需要立即处理' },
];

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('请输入工单标题');
      return;
    }

    setLoading(true);
    try {
      const ticket = await createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        category_id: categoryId ? parseInt(categoryId) : null,
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err: any) {
      setError(err.message || '创建失败');
    }
    setLoading(false);
  };

  const categoryOptions = categories.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  return (
    <Layout>
      <div className="max-w-3xl">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors mb-4 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            返回
          </button>
          <h1 className="text-3xl font-bold text-surface-100">创建工单</h1>
          <p className="text-surface-400 mt-1">填写以下信息提交您的问题或请求</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label="标题"
              placeholder="简要描述您的问题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="详细描述"
              placeholder="请详细说明问题的现象、影响范围、复现步骤等..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label="优先级"
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />

              <Select
                label="分类"
                options={categoryOptions}
                placeholder="选择分类（可选）"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                提交工单
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                取消
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
