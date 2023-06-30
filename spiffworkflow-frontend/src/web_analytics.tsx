export const sendWebAnalyticsEvent = (eventName: string, parameters: any) => {
  (window as any).gtag('event', eventName, parameters);
};

export const sendSelectContentEvent = (
  contentType: string,
  contentId: string
) => {
  sendWebAnalyticsEvent('select_content', {
    content_type: contentType,
    content_id: contentId,
  });
};
