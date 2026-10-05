# P1 数学验收指标表

| # | 维度 | 指标 | Demo | Real |
|---|---|---|---|---|
| 1 | RTP | 总回收率 | 130~250% | 88~93% (硬门禁 ≤94%) |
| 2 | Hit Rate | 中奖率 | 45~60% | 20~35% |
| 3 | Volatility | 波动率（倍下注） | 中等 (3~10) | 中高 (5~15) |
| 4 | Zero Streak | 最长空转（局） | ≤30 | ≤50 |
| 5 | Zero Streak P50/P95 | 空转分位 | P50≤2 / P95≤8 | P50≤4 / P95≤15 |
| 6 | Tumble Depth | 平均/最深 | 0.5~1.5 / ≥10 | 0.3~0.8 / ≥8 |
| 7 | Win Median | 中位赢额（倍下注） | 0（空转过半）| 0 |
| 8 | Win P90/P95 | 高分位 | P90≤3x / P95≤8x | P90≤3x / P95≤8x |
| 9 | Multiplier Dist | 2x~500x 分布 | 合理长尾 | 更偏 2x~10x |
| 10 | Multiplier 组合 | 单局多次累加频率 | ≤5% | ≤3% |
| 11 | Near Bonus | 恰好 3 Scatter 频率 | 提示"差一个"| 同 |
| 12 | FS Rate | 触发频率 | 1/30~1/50 | 1/180~1/250 |
| 13 | Retrigger | FS 内重触发率 | 30%+ | 15%+ |
| 14 | Big Win Rate | ≥10x 频率 | ≤2% | ≤2% |
| 15 | Mega Win Rate | ≥50x 频率 | ≤0.3% | ≤0.3% |
| 16 | RTP 收敛 | 1K/10K/100K/1M 收敛性 | 稳定 | 稳定 |

## 参数联动原则

- 调整 Scatter Weight → 影响 Near Bonus + FS Rate + Bonus RTP
- 调整 Multiplier Prob → 影响 Volatility + RTP 上限
- 调整 Symbol Weights → 影响 Hit Rate + Win Distribution
- 调整 payScale → 影响整体 RTP（不改结构）

## 硬约束

- **Real RTP ≤ 94%** 是硬失败条件
- **Demo/Real 差异只能来自配置**，运行时不得偷改结果
- 所有指标通过 Simulator v3 输出
