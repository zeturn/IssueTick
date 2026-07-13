import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket, fetchCategories, type Category } from '../api/client';
import { useI18n } from '../i18n';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';

export default function CreateTicketPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
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
      setError(t('create.error.titleRequired'));
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
      setError(err.message || t('create.error.failed'));
    }
    setLoading(false);
  };

  const priorityOptions = [
    { value: 'low', label: `${t('priority.low')} — ${t('priority.low.note')}` },
    { value: 'medium', label: `${t('priority.medium')} — ${t('priority.medium.note')}` },
    { value: 'high', label: `${t('priority.high')} — ${t('priority.high.note')}` },
    { value: 'urgent', label: `${t('priority.urgent')} — ${t('priority.urgent.note')}` },
  ];

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
            {t('create.back')}
          </button>
          <h1 className="text-3xl font-bold text-surface-100">{t('create.title')}</h1>
          <p className="text-surface-400 mt-1">{t('create.subtitle')}</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <Input
              label={t('create.field.title')}
              placeholder={t('create.field.titlePlaceholder')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label={t('create.field.description')}
              placeholder={t('create.field.descriptionPlaceholder')}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Select
                label={t('create.field.priority')}
                options={priorityOptions}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              />

              <Select
                label={t('create.field.category')}
                options={categoryOptions}
                placeholder={t('create.field.categoryPlaceholder')}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={loading} className="flex-1">
                {t('create.submit')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                {t('create.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
}
