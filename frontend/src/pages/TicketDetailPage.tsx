import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../i18n';
import {
  fetchTicket, fetchComments, fetchHandlers,
  updateTicket, createComment, assignTicket,
  type Ticket, type Comment as CommentType, type User,
} from '../api/client';
import Layout from '../components/layout/Layout';
import Card, { CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import TicketStatusBadge from '../components/ticket/TicketStatusBadge';
import TicketPriorityBadge from '../components/ticket/TicketPriorityBadge';

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { t, formatDateTime } = useI18n();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [handlers, setHandlers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment form
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Assign modal
  const [showAssign, setShowAssign] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [fetchedTicket, fetchedComments] = await Promise.all([
          fetchTicket(parseInt(id)),
          fetchComments(parseInt(id)),
        ]);
        setTicket(fetchedTicket);
        setComments(fetchedComments);
        if (currentUser && ['admin', 'lead'].includes(currentUser.role)) {
          const h = await fetchHandlers();
          setHandlers(h);
        }
      } catch { navigate('/tickets'); }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return;
    setSubmitting(true);
    try {
      const comment = await createComment(parseInt(id), newComment.trim(), isInternal);
      setComments([...comments, comment]);
      setNewComment('');
      setIsInternal(false);
      // Refresh ticket to get updated status
      const updated = await fetchTicket(parseInt(id));
      setTicket(updated);
    } catch { /* ignore */ }
    setSubmitting(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;
    try {
      const updated = await updateTicket(parseInt(id), { status: newStatus });
      setTicket(updated);
    } catch (err: any) {
      alert(err.message || t('detail.statusUpdateFailed'));
    }
  };

  const handleAssign = async () => {
    if (!id || !assigneeId) return;
    try {
      const updated = await assignTicket(parseInt(id), parseInt(assigneeId));
      setTicket(updated);
      setShowAssign(false);
    } catch { /* ignore */ }
  };

  if (loading || !ticket) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-surface-800 rounded animate-pulse" />
          <div className="h-64 bg-surface-800 rounded-xl animate-pulse" />
        </div>
      </Layout>
    );
  }

  const isStaff = currentUser && ['handler', 'lead', 'admin'].includes(currentUser.role);
  const isCreator = currentUser && ticket.creator && currentUser.id === ticket.creator.id;
  const isLead = currentUser && ['lead', 'admin'].includes(currentUser.role);

  // Available status actions based on current status and role
  const statusActions: { label: string; status: string; variant: 'primary' | 'success' | 'danger' | 'warning' | 'secondary' }[] = [];
  if (isStaff) {
    if (ticket.status === 'assigned') statusActions.push({ label: t('detail.action.start'), status: 'in_progress', variant: 'primary' });
    if (ticket.status === 'in_progress') {
      statusActions.push({ label: t('detail.action.pending'), status: 'pending_user', variant: 'warning' });
      statusActions.push({ label: t('detail.action.resolve'), status: 'resolved', variant: 'success' });
    }
    if (ticket.status === 'new' || ticket.status === 'assigned') {
      statusActions.push({ label: t('detail.action.cancel'), status: 'cancelled', variant: 'danger' });
    }
  }
  if (isCreator) {
    if (ticket.status === 'resolved') {
      statusActions.push({ label: t('detail.action.close'), status: 'closed', variant: 'success' });
      statusActions.push({ label: t('detail.action.reopen'), status: 'in_progress', variant: 'warning' });
    }
    if (ticket.status === 'new') {
      statusActions.push({ label: t('detail.action.cancel'), status: 'cancelled', variant: 'danger' });
    }
  }

  return (
    <Layout>
      <div className="space-y-5">
        {/* Back button + header */}
        <div>
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-2 text-sm text-surface-400 hover:text-surface-200 transition-colors mb-4 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            {t('detail.back')}
          </button>

          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-sm font-mono text-surface-500">{ticket.ticket_number}</span>
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
              <h1 className="text-3xl font-bold text-surface-100">{ticket.title}</h1>
            </div>

            {isLead && (
              <Button variant="secondary" onClick={() => setShowAssign(true)}>
                {ticket.assignee ? t('detail.reassign') : t('detail.assign')}
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="xl:col-span-2 space-y-5">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.description')}</CardTitle>
              </CardHeader>
              <div className="text-sm text-surface-300 whitespace-pre-wrap leading-relaxed">
                {ticket.description || t('detail.noDescription')}
              </div>
            </Card>

            {/* Status Actions */}
            {statusActions.length > 0 && (
              <Card className="!p-4">
                <div className="flex flex-wrap gap-2">
                  {statusActions.map((action) => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleStatusChange(action.status)}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Comments / Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{t('detail.discussion', { n: comments.length })}</CardTitle>
              </CardHeader>

              <div className="space-y-4 mb-6">
                {comments.length === 0 ? (
                  <p className="text-sm text-surface-500 text-center py-6">{t('detail.noDiscussion')}</p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className={`
                        flex gap-3 animate-fade-in
                        ${comment.is_internal ? 'opacity-80' : ''}
                      `}
                    >
                      <Avatar
                        name={comment.user?.name || ''}
                        url={comment.user?.avatar_url}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-surface-200">
                            {comment.user?.name || comment.user?.email}
                          </span>
                          {comment.is_internal && (
                            <Badge variant="warning">{t('detail.internalNote')}</Badge>
                          )}
                          <span className="text-xs text-surface-500">
                            {formatDateTime(comment.created_at)}
                          </span>
                        </div>
                        <div className={`
                          text-sm text-surface-300 whitespace-pre-wrap p-3 rounded-lg
                          ${comment.is_internal
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-surface-900'
                          }
                        `}>
                          {comment.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add comment */}
              {!['closed', 'cancelled'].includes(ticket.status) && (
                <div className="border-t border-surface-700/50 pt-4">
                  <Textarea
                    placeholder={t('detail.replyPlaceholder')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      {isStaff && (
                        <label className="flex items-center gap-2 text-xs text-surface-400 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="rounded border-surface-600 bg-white text-primary-600 focus:ring-primary-500 cursor-pointer"
                          />
                          {t('detail.internalNoteHint')}
                        </label>
                      )}
                    </div>
                    <Button onClick={handleAddComment} loading={submitting} disabled={!newComment.trim()}>
                      {t('detail.sendReply')}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar info */}
          <div className="space-y-5">
            <Card>
              <h4 className="text-sm font-semibold text-surface-200 mb-4">{t('detail.info')}</h4>
              <div className="space-y-4">
                <InfoRow label={t('detail.info.creator')}>
                  {ticket.creator && (
                    <div className="flex items-center gap-2">
                      <Avatar name={ticket.creator.name} url={ticket.creator.avatar_url} size="sm" />
                      <span className="text-sm text-surface-200">{ticket.creator.name || ticket.creator.email}</span>
                    </div>
                  )}
                </InfoRow>

                <InfoRow label={t('detail.info.assignee')}>
                  {ticket.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={ticket.assignee.name} url={ticket.assignee.avatar_url} size="sm" />
                      <span className="text-sm text-surface-200">{ticket.assignee.name || ticket.assignee.email}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-surface-500">{t('detail.unassigned')}</span>
                  )}
                </InfoRow>

                <InfoRow label={t('detail.info.category')}>
                  {ticket.category ? (
                    <span className="flex items-center gap-1.5 text-sm" style={{ color: ticket.category.color }}>
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ticket.category.color }} />
                      {ticket.category.name}
                    </span>
                  ) : (
                    <span className="text-sm text-surface-500">{t('detail.uncategorized')}</span>
                  )}
                </InfoRow>

                <InfoRow label={t('detail.info.created')}>
                  <span className="text-sm text-surface-300">
                    {formatDateTime(ticket.created_at)}
                  </span>
                </InfoRow>

                {ticket.resolved_at && (
                  <InfoRow label={t('detail.info.resolved')}>
                    <span className="text-sm text-emerald-700">
                      {formatDateTime(ticket.resolved_at)}
                    </span>
                  </InfoRow>
                )}

                {ticket.closed_at && (
                  <InfoRow label={t('detail.info.closed')}>
                    <span className="text-sm text-surface-400">
                      {formatDateTime(ticket.closed_at)}
                    </span>
                  </InfoRow>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Assign Modal */}
      <Modal open={showAssign} onClose={() => setShowAssign(false)} title={t('detail.modal.assignTitle')}>
        <div className="space-y-4">
          <Select
            label={t('detail.modal.selectHandler')}
            options={handlers.map((h) => ({ value: String(h.id), label: `${h.name || h.email} (${t(`role.${h.role}`)})` }))}
            placeholder={t('detail.modal.selectHandlerPlaceholder')}
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
          />
          <div className="flex gap-3 pt-2">
            <Button onClick={handleAssign} disabled={!assigneeId} className="flex-1">{t('detail.modal.confirmAssign')}</Button>
            <Button variant="secondary" onClick={() => setShowAssign(false)}>{t('create.cancel')}</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-surface-500 mb-1">{label}</p>
      {children}
    </div>
  );
}
