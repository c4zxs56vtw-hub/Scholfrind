import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Button,
  CurationReliabilityNote,
  Modal,
  PageHeader,
  Panel,
} from '../../components/ui/DesignSystem';
import { useApp } from '../../context/AppContext';
import { Scholarship } from '../../types';

/**
 * 1. TABLEAU DE BORD CURATEUR (/curateur/tableau-de-bord)
 */
export const CuratorDashboardPage: React.FC = () => {
  const { scholarships, sources, duplicates, curateScholarship } = useApp();
  const navigate = useNavigate();

  const pendingCount = scholarships.filter(
    (s) => s.curationStatus === 'PENDING_REVIEW'
  ).length;
  const verifiedCount = scholarships.filter(
    (s) => s.curationStatus === 'VERIFIED'
  ).length;
  const rejectedOrArchivedCount = scholarships.filter(
    (s) => s.curationStatus === 'REJECTED' || s.curationStatus === 'ARCHIVED'
  ).length;
  const sourcesToCheckCount = sources.filter(
    (s) => s.reliabilityStatus === 'A_CONTROLER'
  ).length;
  const duplicatesPendingCount = duplicates.filter(
    (d) => d.status === 'PENDING'
  ).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-8">
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#203454] tracking-tight">
            Espace Curateur
          </h1>
          <p className="text-sm text-[#69768C] mt-1">
            Vérifiez la fiabilité des bourses et des sources officielles avant publication.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate('/curateur/annonces')}
        >
          Vérifier les annonces ({pendingCount})
        </Button>
      </section>

      {/* 5 raccourcis d'activité curateur */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Link
          to="/curateur/annonces"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">En attente</div>
          <div className="text-2xl font-bold text-[#9A421D] tabular-nums mt-1">
            {pendingCount}
          </div>
        </Link>
        <Link
          to="/curateur/annonces"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Vérifiées</div>
          <div className="text-2xl font-bold text-[#14533C] tabular-nums mt-1">
            {verifiedCount}
          </div>
        </Link>
        <Link
          to="/curateur/annonces"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Archivées</div>
          <div className="text-2xl font-bold text-[#69768C] tabular-nums mt-1">
            {rejectedOrArchivedCount}
          </div>
        </Link>
        <Link
          to="/curateur/sources"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Sources à revoir</div>
          <div className="text-2xl font-bold text-[#3457D5] tabular-nums mt-1">
            {sourcesToCheckCount}
          </div>
        </Link>
        <Link
          to="/curateur/doublons"
          className="bg-white border border-[#E6ECF5] rounded-2xl p-4 shadow-xs hover:border-[#3457D5]/40 transition-all"
        >
          <div className="text-xs text-[#69768C]">Doublons</div>
          <div className="text-2xl font-bold text-[#3457D5] tabular-nums mt-1">
            {duplicatesPendingCount}
          </div>
        </Link>
      </section>

      {/* File d'attente prioritaire */}
      <Panel
        title="Annonces à vérifier en priorité"
        subtitle="Une annonce non vérifiée est signalée « À vérifier » aux étudiants"
        headerRight={
          <Link
            to="/curateur/annonces"
            className="text-xs font-semibold text-[#3457D5] hover:underline"
          >
            Ouvrir l’atelier →
          </Link>
        }
      >
        <div className="space-y-3 text-xs">
          {scholarships
            .filter((s) => s.curationStatus === 'PENDING_REVIEW')
            .map((sch) => (
              <div
                key={sch.id}
                className="p-4 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="font-bold text-[#203454] text-sm">
                    {sch.title}
                  </div>
                  <div className="text-[#69768C]">
                    Source : <strong className="text-[#253047]">{sch.sourceName}</strong> · Collectée le{' '}
                    <span className="tabular-nums">
                      {sch.retrievedAt}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      curateScholarship(
                        sch.id,
                        'REJECTED',
                        undefined,
                        'Annonce rejetée pour source non conforme.'
                      )
                    }
                  >
                    Rejeter
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      curateScholarship(
                        sch.id,
                        'VERIFIED',
                        undefined,
                        'Source officielle et critères contrôlés et validés par le curateur.'
                      )
                    }
                  >
                    Valider & Publier
                  </Button>
                </div>
              </div>
            ))}
          {pendingCount === 0 && (
            <p className="text-[#69768C] py-4 text-center">
              Toutes les annonces collectées sont à jour.
            </p>
          )}
        </div>
      </Panel>
    </div>
  );
};

/**
 * 2. VÉRIFICATION DES ANNONCES (/curateur/annonces)
 */
export const CuratorAnnouncementsPage: React.FC = () => {
  const { scholarships, curateScholarship } = useApp();
  const [editingScholarship, setEditingScholarship] =
    useState<Scholarship | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDeadline, setEditDeadline] = useState('');
  const [editMinGrade, setEditMinGrade] = useState('');
  const [editSourceUrl, setEditSourceUrl] = useState('');
  const [curatorNote, setCuratorNote] = useState(
    'Vérification de la source officielle et correction des critères effectuées.'
  );

  const openEditModal = (sch: Scholarship) => {
    setEditingScholarship(sch);
    setEditTitle(sch.title);
    setEditDeadline(sch.deadline);
    setEditMinGrade(
      sch.criteria.minGradeOut20 !== null
        ? String(sch.criteria.minGradeOut20)
        : ''
    );
    setEditSourceUrl(sch.sourceUrl);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="ATELIER DE CONTRÔLE DOCUMENTAIRE"
        title="Vérification et correction des annonces"
        subtitle="Consultez chaque annonce collectée, vérifiez sa source officielle, corrigez ses critères d’éligibilité, puis validez, rejetez ou archivez l’offre."
      />

      <div className="space-y-4">
        {scholarships.map((sch) => (
          <Panel
            key={sch.id}
            title={sch.title}
            subtitle={`Code : ${sch.code} · Organisme : ${sch.organizationName} · Pays : ${sch.hostCountry}`}
            headerRight={
              <CurationReliabilityNote
                status={sch.curationStatus}
                lastVerifiedAt={sch.lastVerifiedAt}
                isDemoData={sch.isDemoData}
              />
            }
          >
            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[#69768C] block">Source déclarée</span>
                  <strong className="text-[#253047]">{sch.sourceName}</strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">
                    Date de récupération
                  </span>
                  <strong className="font-mono tabular-nums">
                    {sch.retrievedAt}
                  </strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">
                    Dernière vérification
                  </span>
                  <strong className="font-mono tabular-nums">
                    {sch.lastVerifiedAt || 'Jamais vérifiée'}
                  </strong>
                </div>
                <div>
                  <span className="text-[#69768C] block">
                    Moyenne & Date limite
                  </span>
                  <strong className="font-mono tabular-nums">
                    Min {sch.criteria.minGradeOut20 ?? 'N/A'}/20 · Échéance{' '}
                    {sch.deadline}
                  </strong>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E6ECF5]">
                <span className="text-[#69768C] font-mono">
                  URL Source : {sch.sourceUrl}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => openEditModal(sch)}
                  >
                    Corriger les informations
                  </Button>
                  {sch.curationStatus !== 'VERIFIED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        curateScholarship(
                          sch.id,
                          'VERIFIED',
                          undefined,
                          'Validation et publication par le curateur après contrôle de la source.'
                        )
                      }
                    >
                      Valider & Publier
                    </Button>
                  )}
                  {sch.curationStatus !== 'REJECTED' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() =>
                        curateScholarship(
                          sch.id,
                          'REJECTED',
                          undefined,
                          'Annonce rejetée : critères incomplets ou source non vérifiable.'
                        )
                      }
                    >
                      Rejeter
                    </Button>
                  )}
                  {sch.curationStatus !== 'ARCHIVED' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        curateScholarship(
                          sch.id,
                          'ARCHIVED',
                          undefined,
                          'Annonce archivée (campagne périmée).'
                        )
                      }
                    >
                      Archiver (Périmée)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      {/* Modale de correction des informations d'une bourse par le curateur */}
      <Modal
        isOpen={Boolean(editingScholarship)}
        onClose={() => setEditingScholarship(null)}
        title="Corriger les critères et métadonnées de l’annonce"
        subtitle="Toute modification est enregistrée dans l’historique de fiabilité de l’annonce."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditingScholarship(null)}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (editingScholarship) {
                  curateScholarship(
                    editingScholarship.id,
                    'VERIFIED',
                    {
                      title: editTitle,
                      deadline: editDeadline,
                      sourceUrl: editSourceUrl,
                      criteria: {
                        ...editingScholarship.criteria,
                        minGradeOut20: editMinGrade
                          ? parseFloat(editMinGrade)
                          : null,
                      },
                    },
                    curatorNote
                  );
                  setEditingScholarship(null);
                }
              }}
            >
              Enregistrer les corrections & Valider
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div>
            <label
              htmlFor="cur-edit-title"
              className="block font-medium text-[#253047] mb-1"
            >
              Intitulé vérifié de l’annonce
            </label>
            <input
              id="cur-edit-title"
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="cur-edit-deadline"
                className="block font-medium text-[#253047] mb-1"
              >
                Date limite
              </label>
              <input
                id="cur-edit-deadline"
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
              />
            </div>
            <div>
              <label
                htmlFor="cur-edit-grade"
                className="block font-medium text-[#253047] mb-1"
              >
                Moyenne minimale (/20)
              </label>
              <input
                id="cur-edit-grade"
                type="number"
                step="0.5"
                value={editMinGrade}
                onChange={(e) => setEditMinGrade(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="cur-edit-url"
              className="block font-medium text-[#253047] mb-1"
            >
              URL de la source officielle vérifiée
            </label>
            <input
              id="cur-edit-url"
              type="text"
              value={editSourceUrl}
              onChange={(e) => setEditSourceUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
            />
          </div>
          <div>
            <label
              htmlFor="cur-edit-note"
              className="block font-medium text-[#253047] mb-1"
            >
              Note d’audit de modification
            </label>
            <textarea
              id="cur-edit-note"
              rows={2}
              value={curatorNote}
              onChange={(e) => setCuratorNote(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

/**
 * 3. SOURCES OFFICIELLES (/curateur/sources), DOUBLONS (/curateur/doublons) & HISTORIQUE (/curateur/historique)
 */
export const CuratorSourcesPage: React.FC = () => {
  const { sources, updateSourceReliability, createOfficialSource } = useApp();
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Ambassade / Coopération');
  const [newCountry, setNewCountry] = useState('France');
  const [newUrl, setNewUrl] = useState('https://');
  const [newNotes, setNewNotes] = useState('');

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newUrl.trim()) return;
    createOfficialSource({
      name: newName,
      institutionType: newType,
      country: newCountry,
      officialUrl: newUrl,
      notes: newNotes,
    });
    setNewName('');
    setNewUrl('https://');
    setNewNotes('');
    setAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="GESTION DE LA FIABILITÉ DES SOURCES"
        title="Registre des sources d’annonces"
        subtitle="Contrôlez la fiabilité des portails institutionnels (universités, ambassades, ministères, fondations)."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddModalOpen(true)}
          >
            + Enregistrer une source officielle
          </Button>
        }
      />

      <div className="space-y-4">
        {sources.map((src) => (
          <Panel
            key={src.id}
            title={src.name}
            subtitle={`${src.institutionType} · Pays : ${src.country} · Dernier contrôle : ${src.lastCheckedAt}`}
            headerRight={
              <span className="px-2.5 py-1 rounded bg-[#3457D5]/10 text-[#203454] font-semibold text-xs">
                Statut : {src.reliabilityStatus}
              </span>
            }
          >
            <div className="space-y-3 text-xs">
              <p className="text-[#69768C]">{src.notes}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#E6ECF5]">
                <span className="font-mono text-[#253047]">
                  URL : {src.officialUrl} ({src.activeAnnouncementsCount}{' '}
                  annonce(s) liée(s))
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      updateSourceReliability(
                        src.id,
                        'FIABLE_VERIFIEE',
                        'Source contrôlée et certifiée fiable par le curateur.'
                      )
                    }
                  >
                    Certifier fiable
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      updateSourceReliability(
                        src.id,
                        'A_CONTROLER',
                        'Source placée sous surveillance.'
                      )
                    }
                  >
                    Marquer à contrôler
                  </Button>
                </div>
              </div>
            </div>
          </Panel>
        ))}
      </div>

      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Enregistrer une nouvelle source officielle (POST /curation/sources)"
        subtitle="Ajoutez un portail institutionnel vérifiable au répertoire de surveillance."
        footer={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setAddModalOpen(false)}
            >
              Annuler
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddSource}>
              Enregistrer la source
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddSource} className="space-y-3 text-xs">
          <div>
            <label
              htmlFor="src-new-name"
              className="block font-medium text-[#253047] mb-1"
            >
              Nom officiel du portail ou de l’institution *
            </label>
            <input
              id="src-new-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: DAAD Cameroun — Portail Bourses"
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="src-new-type"
                className="block font-medium text-[#253047] mb-1"
              >
                Type d’institution
              </label>
              <input
                id="src-new-type"
                type="text"
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
            <div>
              <label
                htmlFor="src-new-country"
                className="block font-medium text-[#253047] mb-1"
              >
                Pays *
              </label>
              <input
                id="src-new-country"
                type="text"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="src-new-url"
              className="block font-medium text-[#253047] mb-1"
            >
              URL officielle *
            </label>
            <input
              id="src-new-url"
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E6ECF5] rounded-xl font-mono"
            />
          </div>
          <div>
            <label
              htmlFor="src-new-notes"
              className="block font-medium text-[#253047] mb-1"
            >
              Notes de vérification
            </label>
            <textarea
              id="src-new-notes"
              rows={2}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#E6ECF5] rounded-xl"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export const CuratorDuplicatesPage: React.FC = () => {
  const { duplicates, scholarships, resolveDuplicate } = useApp();

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="DÉDUPLICATION DU CATALOGUE"
        title="Gestion des doublons détectés"
        subtitle="Comparez les annonces présentant des similitudes et archivez les doublons confirmés."
      />

      <div className="space-y-4">
        {duplicates.map((dup) => {
          const primary = scholarships.find(
            (s) => s.id === dup.primaryScholarshipId
          );
          const suspect = scholarships.find(
            (s) => s.id === dup.duplicateScholarshipId
          );
          return (
            <Panel
              key={dup.id}
              title={`Alerte doublon · Indice de proximité : ${dup.similarityScore} %`}
              subtitle={`Détecté le ${dup.detectedAt} · Statut : ${dup.status}`}
            >
              <div className="space-y-4 text-xs">
                <p className="text-[#253047]">{dup.reason}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl">
                    <div className="font-semibold text-[#203454]">
                      Annonce de référence : {primary?.title}
                    </div>
                    <div className="text-[#69768C] mt-1">
                      Code : {primary?.code} · Source : {primary?.sourceName}
                    </div>
                  </div>
                  <div className="p-3 bg-[#F8FAFD] border border-[#E6ECF5] rounded-xl">
                    <div className="font-semibold text-[#9A421D]">
                      Annonce suspectée : {suspect?.title}
                    </div>
                    <div className="text-[#69768C] mt-1">
                      Code : {suspect?.code} · Source : {suspect?.sourceName}
                    </div>
                  </div>
                </div>
                {dup.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => resolveDuplicate(dup.id, 'DISMISSED')}
                    >
                      Conserver les deux (Offres distinctes)
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() =>
                        resolveDuplicate(dup.id, 'MERGED_ARCHIVED')
                      }
                    >
                      Fusionner & Archiver le doublon
                    </Button>
                  </div>
                )}
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};

export const CuratorHistoryPage: React.FC = () => {
  const { scholarships } = useApp();

  const allHistory = scholarships.flatMap((s) =>
    s.modificationHistory.map((m) => ({
      ...m,
      scholarshipTitle: s.title,
      scholarshipCode: s.code,
    }))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        kicker="TRAÇABILITÉ ÉDITORIALE"
        title="Historique des validations et modifications"
        subtitle="Chaque annonce conserve sa date de récupération, sa dernière vérification et l’historique complet de ses révisions."
      />

      <Panel noPadding>
        <div className="divide-y divide-[#E6ECF5] text-xs">
          {allHistory.map((h) => (
            <div
              key={h.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
            >
              <div>
                <div className="font-semibold text-[#203454]">
                  [{h.scholarshipCode}] {h.scholarshipTitle}
                </div>
                <div className="text-[#253047] mt-0.5">{h.summary}</div>
              </div>
              <div className="text-[#69768C] font-mono tabular-nums shrink-0">
                {h.date} · {h.actorName}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
};
