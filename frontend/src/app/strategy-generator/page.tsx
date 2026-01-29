"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Wand2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  Copy,
  Play,
  Save,
  Lightbulb,
  Zap,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

// Types
interface WizardStep {
  id: number;
  title: string;
  description: string;
}

interface StrategyConfig {
  name: string;
  type: "trend" | "meanReversion" | "momentum" | "arbitrage" | "ml";
  timeframe: string;
  assets: string[];
  riskLevel: "conservative" | "moderate" | "aggressive";
  targetReturn: number;
  maxDrawdown: number;
  indicators: string[];
  entryConditions: string[];
  exitConditions: string[];
  positionSizing: string;
}

interface GeneratedStrategy {
  id: string;
  name: string;
  description: string;
  backtest: {
    sharpe: number;
    returns: number;
    maxDD: number;
    winRate: number;
    trades: number;
  };
  code: string;
  confidence: number;
}

// Step and strategy type IDs for translations
const WIZARD_STEP_IDS = [
  { id: 1, titleKey: "stepStrategyType", descKey: "stepStrategyTypeDesc" },
  { id: 2, titleKey: "stepRiskProfile", descKey: "stepRiskProfileDesc" },
  { id: 3, titleKey: "stepIndicators", descKey: "stepIndicatorsDesc" },
  { id: 4, titleKey: "stepEntryRules", descKey: "stepEntryRulesDesc" },
  { id: 5, titleKey: "stepExitRules", descKey: "stepExitRulesDesc" },
  { id: 6, titleKey: "stepGenerate", descKey: "stepGenerateDesc" },
];

const STRATEGY_TYPE_IDS = [
  { id: "trend", nameKey: "typeTrendFollowing", descKey: "typeTrendFollowingDesc", icon: TrendingUp },
  { id: "meanReversion", nameKey: "typeMeanReversion", descKey: "typeMeanReversionDesc", icon: Activity },
  { id: "momentum", nameKey: "typeMomentum", descKey: "typeMomentumDesc", icon: Zap },
  { id: "arbitrage", nameKey: "typeArbitrage", descKey: "typeArbitrageDesc", icon: BarChart3 },
  { id: "ml", nameKey: "typeMlBased", descKey: "typeMlBasedDesc", icon: Sparkles },
];

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1d"];
const ASSETS = ["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "AVAX", "DOT", "MATIC"];

const INDICATORS = [
  { id: "rsi", name: "RSI (14)", category: "Momentum" },
  { id: "macd", name: "MACD", category: "Trend" },
  { id: "bb", name: "Bollinger Bands", category: "Volatility" },
  { id: "ema20", name: "EMA 20", category: "Trend" },
  { id: "ema50", name: "EMA 50", category: "Trend" },
  { id: "atr", name: "ATR (14)", category: "Volatility" },
  { id: "volume", name: "Volume MA", category: "Volume" },
  { id: "obv", name: "OBV", category: "Volume" },
  { id: "stoch", name: "Stochastic", category: "Momentum" },
  { id: "adx", name: "ADX", category: "Trend" },
];

const ENTRY_CONDITIONS = [
  "RSI crosses above 30 (oversold)",
  "RSI crosses below 70 (overbought)",
  "MACD line crosses signal line",
  "Price breaks above Bollinger upper band",
  "Price breaks below Bollinger lower band",
  "EMA 20 crosses above EMA 50 (golden cross)",
  "EMA 20 crosses below EMA 50 (death cross)",
  "Volume spike > 2x average",
  "ADX > 25 (strong trend)",
  "Price pullback to EMA 20 in uptrend",
];

const EXIT_CONDITIONS = [
  "Take profit at 2% gain",
  "Take profit at 5% gain",
  "Stop loss at 1% loss",
  "Stop loss at 2% loss",
  "Trailing stop 1%",
  "RSI reaches overbought/oversold",
  "MACD signal reversal",
  "Price touches opposite Bollinger band",
  "Time-based exit (24h max hold)",
  "Volatility spike exit (ATR > 2x)",
];

export default function StrategyGeneratorPage() {
  const t = useTranslations("strategyGeneratorPage");
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStrategies, setGeneratedStrategies] = useState<GeneratedStrategy[]>([]);
  const [config, setConfig] = useState<StrategyConfig>({
    name: "",
    type: "trend",
    timeframe: "1h",
    assets: ["BTC", "ETH"],
    riskLevel: "moderate",
    targetReturn: 20,
    maxDrawdown: 15,
    indicators: ["rsi", "macd", "ema20"],
    entryConditions: [],
    exitConditions: [],
    positionSizing: "fixed",
  });

  const handleNext = () => {
    if (currentStep < WIZARD_STEP_IDS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const strategies: GeneratedStrategy[] = [
      {
        id: "gen-1",
        name: `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Alpha v1`,
        description: `AI-optimized ${config.type} strategy using ${config.indicators.join(", ")} on ${config.timeframe} timeframe`,
        backtest: {
          sharpe: 1.85 + Math.random() * 0.5,
          returns: 25 + Math.random() * 15,
          maxDD: -(10 + Math.random() * 8),
          winRate: 55 + Math.random() * 10,
          trades: 150 + Math.floor(Math.random() * 100),
        },
        code: `# ${config.type} Strategy
class Strategy:
    def __init__(self):
        self.indicators = ${JSON.stringify(config.indicators)}
        self.timeframe = "${config.timeframe}"

    def on_bar(self, bar):
        if self.check_entry():
            self.enter_position()
        elif self.check_exit():
            self.exit_position()`,
        confidence: 85 + Math.random() * 10,
      },
      {
        id: "gen-2",
        name: `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Beta v1`,
        description: `Alternative ${config.type} approach with enhanced risk management`,
        backtest: {
          sharpe: 1.65 + Math.random() * 0.4,
          returns: 20 + Math.random() * 12,
          maxDD: -(8 + Math.random() * 6),
          winRate: 52 + Math.random() * 12,
          trades: 200 + Math.floor(Math.random() * 80),
        },
        code: `# ${config.type} Strategy (Conservative)
class Strategy:
    def __init__(self):
        self.risk_per_trade = 0.01

    def calculate_position_size(self):
        return self.risk_per_trade * self.equity`,
        confidence: 78 + Math.random() * 12,
      },
      {
        id: "gen-3",
        name: `${config.type.charAt(0).toUpperCase() + config.type.slice(1)} Hybrid v1`,
        description: `Combines ${config.type} with ML-enhanced signal filtering`,
        backtest: {
          sharpe: 2.1 + Math.random() * 0.3,
          returns: 32 + Math.random() * 10,
          maxDD: -(12 + Math.random() * 5),
          winRate: 58 + Math.random() * 8,
          trades: 120 + Math.floor(Math.random() * 60),
        },
        code: `# Hybrid ML-Enhanced Strategy
class HybridStrategy:
    def __init__(self, model):
        self.ml_model = model

    def get_signal(self):
        features = self.extract_features()
        return self.ml_model.predict(features)`,
        confidence: 72 + Math.random() * 15,
      },
    ];

    setGeneratedStrategies(strategies);
    setIsGenerating(false);
  };

  const toggleAsset = (asset: string) => {
    setConfig((prev) => ({
      ...prev,
      assets: prev.assets.includes(asset)
        ? prev.assets.filter((a) => a !== asset)
        : [...prev.assets, asset],
    }));
  };

  const toggleIndicator = (indicator: string) => {
    setConfig((prev) => ({
      ...prev,
      indicators: prev.indicators.includes(indicator)
        ? prev.indicators.filter((i) => i !== indicator)
        : [...prev.indicators, indicator],
    }));
  };

  const toggleCondition = (condition: string, type: "entry" | "exit") => {
    const key = type === "entry" ? "entryConditions" : "exitConditions";
    setConfig((prev) => ({
      ...prev,
      [key]: prev[key].includes(condition)
        ? prev[key].filter((c) => c !== condition)
        : [...prev[key], condition],
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{t("selectStrategyType")}</h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {STRATEGY_TYPE_IDS.map((type) => (
                  <div
                    key={type.id}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      config.type === type.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => setConfig((prev) => ({ ...prev, type: type.id as StrategyConfig["type"] }))}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <type.icon className={cn(
                        "h-5 w-5",
                        config.type === type.id ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className="font-medium">{t(type.nameKey)}</span>
                      {config.type === type.id && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{t(type.descKey)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-4">{t("timeframeAssets")}</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("timeframe")}</label>
                  <div className="flex gap-2">
                    {TIMEFRAMES.map((tf) => (
                      <Button
                        key={tf}
                        variant={config.timeframe === tf ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setConfig((prev) => ({ ...prev, timeframe: tf }))}
                      >
                        {tf}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t("assetsSelected", { count: config.assets.length })}</label>
                  <div className="flex flex-wrap gap-2">
                    {ASSETS.map((asset) => (
                      <Button
                        key={asset}
                        variant={config.assets.includes(asset) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => toggleAsset(asset)}
                      >
                        {asset}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">{t("riskProfile")}</h3>
              <div className="grid gap-3 md:grid-cols-3">
                {(["conservative", "moderate", "aggressive"] as const).map((level) => (
                  <div
                    key={level}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      config.riskLevel === level
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => setConfig((prev) => ({ ...prev, riskLevel: level }))}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={cn(
                        "h-5 w-5",
                        level === "conservative" ? "text-green-500" :
                        level === "moderate" ? "text-yellow-500" : "text-red-500"
                      )} />
                      <span className="font-medium">{t(level)}</span>
                      {config.riskLevel === level && (
                        <Check className="h-4 w-4 text-primary ml-auto" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t(`${level}Desc`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium mb-2 block">{t("targetAnnualReturn")}</label>
                <Input
                  type="number"
                  value={config.targetReturn}
                  onChange={(e) => setConfig((prev) => ({ ...prev, targetReturn: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t("maxDrawdown")}</label>
                <Input
                  type="number"
                  value={config.maxDrawdown}
                  onChange={(e) => setConfig((prev) => ({ ...prev, maxDrawdown: Number(e.target.value) }))}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("selectIndicators", { count: config.indicators.length })}</h3>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {INDICATORS.map((indicator) => (
                <div
                  key={indicator.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    config.indicators.includes(indicator.id)
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => toggleIndicator(indicator.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{indicator.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {indicator.category}
                      </Badge>
                    </div>
                    {config.indicators.includes(indicator.id) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("entryConditions", { count: config.entryConditions.length })}</h3>
            <div className="grid gap-2">
              {ENTRY_CONDITIONS.map((condition) => (
                <div
                  key={condition}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    config.entryConditions.includes(condition)
                      ? "border-green-500 bg-green-500/5"
                      : "hover:border-green-500/50"
                  )}
                  onClick={() => toggleCondition(condition, "entry")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span>{condition}</span>
                    </div>
                    {config.entryConditions.includes(condition) && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("exitConditions", { count: config.exitConditions.length })}</h3>
            <div className="grid gap-2">
              {EXIT_CONDITIONS.map((condition) => (
                <div
                  key={condition}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    config.exitConditions.includes(condition)
                      ? "border-red-500 bg-red-500/5"
                      : "hover:border-red-500/50"
                  )}
                  onClick={() => toggleCondition(condition, "exit")}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span>{condition}</span>
                    </div>
                    {config.exitConditions.includes(condition) && (
                      <Check className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            {!isGenerating && generatedStrategies.length === 0 && (
              <div className="text-center py-12">
                <Wand2 className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">{t("readyToGenerate")}</h3>
                <p className="text-muted-foreground mb-6">
                  {t("aiWillCreateStrategies")}
                </p>
                <div className="p-4 rounded-lg bg-muted/50 text-left max-w-md mx-auto mb-6">
                  <h4 className="font-medium mb-2">{t("configurationSummary")}</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>{t("type")}: {config.type}</li>
                    <li>{t("timeframe")}: {config.timeframe}</li>
                    <li>{t("assets")}: {config.assets.join(", ")}</li>
                    <li>{t("risk")}: {t(config.riskLevel)}</li>
                    <li>{t("indicators")}: {config.indicators.length}</li>
                    <li>{t("entryRules")}: {config.entryConditions.length}</li>
                    <li>{t("exitRules")}: {config.exitConditions.length}</li>
                  </ul>
                </div>
                <Button size="lg" onClick={handleGenerate}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t("generateStrategies")}
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <div className="relative">
                  <Wand2 className="h-16 w-16 text-primary mx-auto mb-4 animate-pulse" />
                  <Sparkles className="h-6 w-6 text-yellow-500 absolute top-0 right-1/3 animate-bounce" />
                </div>
                <h3 className="text-xl font-medium mb-2">{t("generatingStrategies")}</h3>
                <p className="text-muted-foreground">
                  {t("aiOptimizing")}
                </p>
              </div>
            )}

            {generatedStrategies.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{t("generatedStrategies")}</h3>
                  <Button variant="outline" size="sm" onClick={handleGenerate}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t("regenerate")}
                  </Button>
                </div>
                {generatedStrategies.map((strategy) => (
                  <Card key={strategy.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{strategy.name}</h4>
                          <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        </div>
                        <Badge variant="outline" className="bg-green-500/10 text-green-500">
                          {strategy.confidence.toFixed(0)}% {t("confidence")}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-5 gap-4 mb-4">
                        <div className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{t("sharpe")}</p>
                          <p className="font-semibold text-green-500">{strategy.backtest.sharpe.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{t("returns")}</p>
                          <p className="font-semibold text-green-500">+{strategy.backtest.returns.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{t("maxDd")}</p>
                          <p className="font-semibold text-red-500">{strategy.backtest.maxDD.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{t("winRate")}</p>
                          <p className="font-semibold">{strategy.backtest.winRate.toFixed(1)}%</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-muted/50">
                          <p className="text-xs text-muted-foreground">{t("trades")}</p>
                          <p className="font-semibold">{strategy.backtest.trades}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" className="flex-1">
                          <Play className="mr-1 h-3 w-3" />
                          {t("deploy")}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Save className="mr-1 h-3 w-3" />
                          {t("save")}
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("description")}
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500">
          <Sparkles className="mr-1 h-3 w-3" />
          {t("aiAssisted")}
        </Badge>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {WIZARD_STEP_IDS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                currentStep > step.id
                  ? "bg-primary border-primary text-primary-foreground"
                  : currentStep === step.id
                  ? "border-primary text-primary"
                  : "border-muted text-muted-foreground"
              )}
            >
              {currentStep > step.id ? (
                <Check className="h-5 w-5" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            {index < WIZARD_STEP_IDS.length - 1 && (
              <div
                className={cn(
                  "w-16 h-0.5 mx-2",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Step Info */}
      <div className="text-center">
        <h2 className="text-lg font-medium">{t(WIZARD_STEP_IDS[currentStep - 1].titleKey)}</h2>
        <p className="text-sm text-muted-foreground">{t(WIZARD_STEP_IDS[currentStep - 1].descKey)}</p>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
        {currentStep < WIZARD_STEP_IDS.length && (
          <Button onClick={handleNext}>
            {t("next")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
