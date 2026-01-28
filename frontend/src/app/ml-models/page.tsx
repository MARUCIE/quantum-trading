"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Brain,
  Play,
  Pause,
  RotateCcw,
  Upload,
  Download,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  Cpu,
  Database,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Settings,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface MLModel {
  id: string;
  name: string;
  type: "classification" | "regression" | "reinforcement";
  algorithm: string;
  status: "training" | "ready" | "deployed" | "failed" | "stopped";
  accuracy: number;
  sharpeRatio: number;
  maxDrawdown: number;
  trainingTime: string;
  lastTrained: string;
  features: number;
  dataPoints: number;
  version: string;
  description: string;
}

interface TrainingJob {
  id: string;
  modelId: string;
  modelName: string;
  progress: number;
  epoch: number;
  totalEpochs: number;
  loss: number;
  valLoss: number;
  startedAt: string;
  eta: string;
}

// Mock data
function generateMockModels(): MLModel[] {
  return [
    {
      id: "model-1",
      name: "BTC Trend Predictor",
      type: "classification",
      algorithm: "XGBoost",
      status: "deployed",
      accuracy: 68.5,
      sharpeRatio: 1.85,
      maxDrawdown: -12.3,
      trainingTime: "45m 32s",
      lastTrained: "2h ago",
      features: 42,
      dataPoints: 150000,
      version: "v2.3.1",
      description: "Predicts BTC price direction using technical indicators and on-chain metrics",
    },
    {
      id: "model-2",
      name: "ETH Volatility Forecast",
      type: "regression",
      algorithm: "LSTM",
      status: "ready",
      accuracy: 72.1,
      sharpeRatio: 1.42,
      maxDrawdown: -18.7,
      trainingTime: "2h 15m",
      lastTrained: "1d ago",
      features: 56,
      dataPoints: 200000,
      version: "v1.8.0",
      description: "Forecasts ETH realized volatility for options pricing and risk management",
    },
    {
      id: "model-3",
      name: "Multi-Asset RL Agent",
      type: "reinforcement",
      algorithm: "PPO",
      status: "training",
      accuracy: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      trainingTime: "running",
      lastTrained: "now",
      features: 128,
      dataPoints: 500000,
      version: "v0.5.0",
      description: "Reinforcement learning agent for portfolio optimization across multiple assets",
    },
    {
      id: "model-4",
      name: "Sentiment Analyzer",
      type: "classification",
      algorithm: "Transformer",
      status: "ready",
      accuracy: 81.2,
      sharpeRatio: 0.95,
      maxDrawdown: -8.5,
      trainingTime: "3h 45m",
      lastTrained: "3d ago",
      features: 768,
      dataPoints: 1000000,
      version: "v1.2.0",
      description: "Analyzes social media and news sentiment for market direction signals",
    },
    {
      id: "model-5",
      name: "Regime Detector",
      type: "classification",
      algorithm: "Hidden Markov",
      status: "failed",
      accuracy: 45.2,
      sharpeRatio: -0.32,
      maxDrawdown: -35.8,
      trainingTime: "1h 20m",
      lastTrained: "5d ago",
      features: 24,
      dataPoints: 80000,
      version: "v0.9.1",
      description: "Detects market regime changes (trending/mean-reverting/volatile)",
    },
  ];
}

function generateMockJobs(): TrainingJob[] {
  return [
    {
      id: "job-1",
      modelId: "model-3",
      modelName: "Multi-Asset RL Agent",
      progress: 67,
      epoch: 134,
      totalEpochs: 200,
      loss: 0.0234,
      valLoss: 0.0312,
      startedAt: "2h 15m ago",
      eta: "1h 05m",
    },
    {
      id: "job-2",
      modelId: "model-6",
      modelName: "Order Flow Predictor",
      progress: 23,
      epoch: 46,
      totalEpochs: 200,
      loss: 0.1523,
      valLoss: 0.1687,
      startedAt: "45m ago",
      eta: "2h 30m",
    },
  ];
}

export default function MLModelsPage() {
  const t = useTranslations("mlModelsPage");
  const [models] = useState<MLModel[]>(generateMockModels);
  const [jobs] = useState<TrainingJob[]>(generateMockJobs);
  const [typeFilter, setTypeFilter] = useState("typeAll");
  const [statusFilter, setStatusFilter] = useState("statusAll");
  const [searchQuery, setSearchQuery] = useState("");

  const MODEL_TYPES = [
    { key: "typeAll", label: t("typeAll"), value: "all" },
    { key: "typeClassification", label: t("typeClassification"), value: "classification" },
    { key: "typeRegression", label: t("typeRegression"), value: "regression" },
    { key: "typeReinforcement", label: t("typeReinforcement"), value: "reinforcement" },
  ];

  const STATUS_FILTERS = [
    { key: "statusAll", label: t("statusAll"), value: "all" },
    { key: "statusDeployed", label: t("statusDeployed"), value: "deployed" },
    { key: "statusReady", label: t("statusReady"), value: "ready" },
    { key: "statusTraining", label: t("statusTraining"), value: "training" },
    { key: "statusFailed", label: t("statusFailed"), value: "failed" },
  ];

  const filteredModels = useMemo(() => {
    const currentType = MODEL_TYPES.find(t => t.key === typeFilter);
    const currentStatus = STATUS_FILTERS.find(s => s.key === statusFilter);
    return models.filter((model) => {
      const matchesType = currentType?.value === "all" || model.type === currentType?.value;
      const matchesStatus = currentStatus?.value === "all" || model.status === currentStatus?.value;
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.algorithm.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [models, typeFilter, statusFilter, searchQuery, MODEL_TYPES, STATUS_FILTERS]);

  const stats = useMemo(() => ({
    total: models.length,
    deployed: models.filter((m) => m.status === "deployed").length,
    training: models.filter((m) => m.status === "training").length,
    avgAccuracy: models.filter((m) => m.accuracy > 0).reduce((sum, m) => sum + m.accuracy, 0) /
      models.filter((m) => m.accuracy > 0).length || 0,
  }), [models]);

  const getStatusIcon = (status: MLModel["status"]) => {
    switch (status) {
      case "deployed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "ready": return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case "training": return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case "failed": return <XCircle className="h-4 w-4 text-red-500" />;
      case "stopped": return <Pause className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: MLModel["status"]) => {
    switch (status) {
      case "deployed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "ready": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "training": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "stopped": return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getTypeColor = (type: MLModel["type"]) => {
    switch (type) {
      case "classification": return "bg-purple-500/10 text-purple-500";
      case "regression": return "bg-blue-500/10 text-blue-500";
      case "reinforcement": return "bg-orange-500/10 text-orange-500";
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            {t("import")}
          </Button>
          <Button size="sm">
            <Brain className="mr-2 h-4 w-4" />
            {t("newModel")}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Brain className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("totalModels")}</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("deployed")}</p>
                <p className="text-xl font-bold">{stats.deployed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
                <Activity className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("training")}</p>
                <p className="text-xl font-bold">{stats.training}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("avgAccuracy")}</p>
                <p className="text-xl font-bold">{stats.avgAccuracy.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Jobs */}
      {jobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              {t("activeTrainingJobs")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 rounded-lg border space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-yellow-500 animate-pulse" />
                    <div>
                      <p className="font-medium">{job.modelName}</p>
                      <p className="text-xs text-muted-foreground">
                        Epoch {job.epoch}/{job.totalEpochs} | Loss: {job.loss.toFixed(4)} | Val Loss: {job.valLoss.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <Clock className="mr-1 h-3 w-3" />
                      {t("eta")}: {job.eta}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Pause className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>{t("progress")}</span>
                    <span>{job.progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("filterType")}</span>
          {MODEL_TYPES.map((type) => (
            <Button
              key={type.key}
              variant={typeFilter === type.key ? "secondary" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(type.key)}
            >
              {type.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t("filterStatus")}</span>
          {STATUS_FILTERS.map((status) => (
            <Button
              key={status.key}
              variant={statusFilter === status.key ? "secondary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status.key)}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => (
          <Card key={model.id} className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(model.status)}
                  <CardTitle className="text-base">{model.name}</CardTitle>
                </div>
                <Badge variant="outline" className={getTypeColor(model.type)}>
                  {model.type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {model.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={cn("border", getStatusColor(model.status))}>
                  {model.status}
                </Badge>
                <Badge variant="outline">{model.algorithm}</Badge>
                <Badge variant="outline">{model.version}</Badge>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{t("accuracy")}</p>
                  <p className={cn(
                    "font-semibold",
                    model.accuracy >= 60 ? "text-green-500" : model.accuracy >= 50 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {model.accuracy > 0 ? `${model.accuracy.toFixed(1)}%` : "N/A"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{t("sharpe")}</p>
                  <p className={cn(
                    "font-semibold",
                    model.sharpeRatio >= 1.5 ? "text-green-500" : model.sharpeRatio >= 1 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {model.sharpeRatio !== 0 ? model.sharpeRatio.toFixed(2) : "N/A"}
                  </p>
                </div>
                <div className="p-2 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground">{t("maxDd")}</p>
                  <p className={cn(
                    "font-semibold",
                    model.maxDrawdown >= -15 ? "text-green-500" : model.maxDrawdown >= -25 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {model.maxDrawdown !== 0 ? `${model.maxDrawdown.toFixed(1)}%` : "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {model.features} {t("features")} | {(model.dataPoints / 1000).toFixed(0)}K {t("samples")}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {model.lastTrained}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {model.status === "ready" && (
                  <Button size="sm" className="flex-1">
                    <Play className="mr-1 h-3 w-3" />
                    {t("deploy")}
                  </Button>
                )}
                {model.status === "deployed" && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <Pause className="mr-1 h-3 w-3" />
                    {t("stop")}
                  </Button>
                )}
                {model.status === "failed" && (
                  <Button size="sm" variant="outline" className="flex-1">
                    <RotateCcw className="mr-1 h-3 w-3" />
                    {t("retry")}
                  </Button>
                )}
                {model.status === "training" && (
                  <Button size="sm" variant="outline" className="flex-1" disabled>
                    <Activity className="mr-1 h-3 w-3 animate-pulse" />
                    {t("trainingProgress")}
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{t("noModelsFound")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("noModelsHint")}
          </p>
        </div>
      )}
    </div>
  );
}
