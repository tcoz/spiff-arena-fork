import { useEffect, useState } from 'react';

/**
 * Take a list of procssInstances, and return some time computations,
 * like median to close, etc.
 * Will likely be used in charts, cards, and such.
 */
export default function useProcessInstanceTimes() {
  const [processInstances, setProcessInstances] = useState<
    Record<string, any>[]
  >([]);
  const [processInstanceTimes, setProcessInstanceTimesReport] = useState<
    Record<string, any>
  >({});

  type ProcessInstanceTimeResults = {
    totalCount: number;
    completedCount: number;
    errorCount: number;
    openCount: number;
    totalTime: number;
    summary: Record<string, any>[];
  };
  useEffect(() => {
    const results = {} as Record<string, any>;
    processInstances.forEach((pi) => {
      if (!(pi.process_model_identifier in results)) {
        results[pi.process_model_identifier] = [];
      }

      results[pi.process_model_identifier].push({
        displayName: pi.process_model_display_name,
        start: pi.start_in_seconds,
        end: pi.end_in_seconds || pi.start_in_seconds,
        duration: pi.end_in_seconds - pi.start_in_seconds,
        status: pi.status,
      });
    });

    const summary = {} as Record<string, any>;
    Object.keys(results).forEach((key) => {
      const times = results[key];
      const durations = times.map((t: Record<string, any>) => t.duration);
      const median = Math.ceil(
        durations.reduce((a: number, b: number) => a + b, 0) /
          (durations.length || 1)
      );

      summary[key] = {
        total: Math.ceil(times.length),
        completed: times.filter(
          (t: Record<string, any>) => t.status === 'complete'
        ).length,
        errors: times.filter((t: Record<string, any>) => t.status === 'error')
          .length,
        open: times.filter(
          (t: Record<string, any>) =>
            !(t.status === 'complete' || t.status === 'error')
        ).length,
        duration: durations.reduce((a: number, b: number) => a + b, 0),
        median,
        times,
      };
    });

    const totalCount = processInstances.length;
    const completedCount = Object.keys(summary).reduce(
      (acc, key) => acc + summary[key].completed,
      0
    );
    const errorCount = Object.keys(summary).reduce(
      (acc, key) => acc + summary[key].errors,
      0
    );
    const openCount = Object.keys(summary).reduce(
      (acc, key) => acc + summary[key].open,
      0
    );
    const totalTime = Object.keys(summary).reduce(
      (acc, key) => acc + summary[key].duration,
      0
    );

    const finalResults = {
      totalCount,
      completedCount,
      errorCount,
      openCount,
      totalTime,
      summary,
    } as ProcessInstanceTimeResults;

    setProcessInstanceTimesReport(finalResults);
  }, [processInstances]);

  return {
    setProcessInstances,
    processInstanceTimes,
  };
}
