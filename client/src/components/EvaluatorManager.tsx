import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Evaluator {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export default function EvaluatorManager() {
  const [evaluators, setEvaluators] = useState<Evaluator[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvaluator, setEditingEvaluator] = useState<Evaluator | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '' });

  useEffect(() => {
    fetchEvaluators();
  }, []);

  const fetchEvaluators = async () => {
    const { data, error } = await supabase
      .from('evaluators')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching evaluators:', error);
    } else {
      setEvaluators(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEvaluator) {
      // 수정
      const { error } = await supabase
        .from('evaluators')
        .update(formData)
        .eq('id', editingEvaluator.id);

      if (error) {
        console.error('Error updating evaluator:', error);
      } else {
        fetchEvaluators();
        closeModal();
      }
    } else {
      // 신규 등록
      const { error } = await supabase
        .from('evaluators')
        .insert([formData]);

      if (error) {
        console.error('Error creating evaluator:', error);
      } else {
        fetchEvaluators();
        closeModal();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      const { error } = await supabase
        .from('evaluators')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting evaluator:', error);
      } else {
        fetchEvaluators();
      }
    }
  };

  const openModal = (evaluator?: Evaluator) => {
    if (evaluator) {
      setEditingEvaluator(evaluator);
      setFormData({ name: evaluator.name, email: evaluator.email || '' });
    } else {
      setEditingEvaluator(null);
      setFormData({ name: '', email: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvaluator(null);
    setFormData({ name: '', email: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">평가자 관리</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          평가자 추가
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">이름</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">이메일</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">등록일</th>
              <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">작업</th>
            </tr>
          </thead>
          <tbody>
            {evaluators.map((evaluator) => (
              <tr key={evaluator.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{evaluator.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{evaluator.email || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {new Date(evaluator.created_at).toLocaleDateString('ko-KR')}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal(evaluator)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(evaluator.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {evaluators.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            등록된 평가자가 없습니다.
          </div>
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {editingEvaluator ? '평가자 수정' : '평가자 추가'}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingEvaluator ? '수정' : '추가'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
