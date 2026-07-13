import { useEffect, useState } from 'react';
import { fetchCategories, createCategory, updateCategory, type Category } from '../api/client';
import { useI18n } from '../i18n';
import Layout from '../components/layout/Layout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

export default function AdminCategoriesPage() {
  const { t } = useI18n();
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
            <h1 className="text-3xl font-bold text-surface-100">{t('categories.title')}</h1>
            <p className="text-surface-400 mt-1">{t('categories.subtitle')}</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="self-start xl:self-auto">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t('categories.new')}
          </Button>
        </div>

        <Card className="!p-0 overflow-hidden">
          {loading ? (
            <div className="space-y-0">
              {[1, 2, 3].map((i) => <div key={i} className="h-14 border-b border-surface-700 animate-pulse bg-surface-800" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12 text-surface-500">
              <p>{t('categories.empty')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-surface-700 bg-surface-900 text-left">
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('categories.col.color')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('categories.col.name')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('categories.col.description')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('categories.col.status')}</th>
                  <th className="px-5 py-3 text-xs font-semibold text-surface-400 uppercase">{t('categories.col.actions')}</th>
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
                        {cat.is_active ? t('categories.enabled') : t('categories.disabled')}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggle(cat)}
                      >
                        {cat.is_active ? t('categories.disabled') : t('categories.enabled')}
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
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t('categories.modal.title')}>
        <div className="space-y-4">
          <Input label={t('categories.field.name')} placeholder={t('categories.field.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} />
          <Input label={t('categories.field.description')} placeholder={t('categories.field.descriptionPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-surface-300">{t('categories.field.color')}</label>
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
              {t('categories.create')}
            </Button>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>{t('create.cancel')}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
