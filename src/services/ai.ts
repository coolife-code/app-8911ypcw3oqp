import ky, { type KyResponse, type AfterResponseHook, type NormalizedOptions } from 'ky';
import {
  createParser,
  type EventSourceParser
} from 'eventsource-parser';

export interface SSEOptions {
  onData: (data: string) => void;
  onEvent?: (event: any) => void;
  onCompleted?: (error?: Error) => void;
  onAborted?: () => void;
  onReconnectInterval?: (interval: number) => void;
}

export const createSSEHook = (options: SSEOptions): AfterResponseHook => {
  const hook: AfterResponseHook = async (request: Request, _options: NormalizedOptions, response: KyResponse) => {
    if (!response.ok || !response.body) {
      return;
    }

    let completed: boolean = false;
    const innerOnCompleted = (error?: Error): void => {
      if (completed) {
        return;
      }

      completed = true;
      options.onCompleted?.(error);
    };

    const isAborted: boolean = false;

    const reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();

    const decoder: TextDecoder = new TextDecoder('utf8');

    const parser: EventSourceParser = createParser({
      onEvent: (event) => {
        if (event.data) {
          options.onEvent?.(event);
          // 处理单 message 多 data字段的场景
          const dataArray: string[] = event.data.split('\n');
          for (const data of dataArray) {
            options.onData(data);
          }
        }
      }
    });

    const read = (): void => {
      if (isAborted) {
        return;
      }

      reader.read().then((result: ReadableStreamReadResult<Uint8Array>) => {
        if (result.done) {
          innerOnCompleted();
          return;
        }

        parser.feed(decoder.decode(result.value, { stream: true }));

        read();
      }).catch(error => {
        /**
         * 判断是否是手动调用 abortController.abort() 而停止的请求
         */
        if (request.signal.aborted) {
          options.onAborted?.();
          return;
        }

        innerOnCompleted(error as Error);
      });
    };

    read();

    return response;
  };

  return hook;
};

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
}

export interface ChatStreamOptions {
  /** 模型调用接口地址 */
  endpoint: string;
  /** 消息列表 */
  messages: ChatMessage[];
  /** 应用id */
  apiId: string;
  /** 流式返回更新回调 */
  onUpdate: (content: string) => void;
  /** 模型调用完成回调 */
  onComplete: () => void;
  /** 模型调用完成回调 */
  onError: (error: Error) => void;
  /** 中断控制 */
  signal?: AbortSignal;
}

export const sendChatStream = async (options: ChatStreamOptions): Promise<void> => {
  const { messages, onUpdate, onComplete, onError, signal } = options;

  let currentContent = '';

  const sseHook = createSSEHook({
    onData: (data: string) => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.choices?.[0]?.delta?.content) {
          currentContent += parsed.choices[0].delta.content;
          onUpdate(currentContent);
        }
      } catch {
        // 忽略解析错误
      }
    },
    onCompleted: (error?: Error) => {
      if (error) {
        onError(error);
      } else {
        onComplete();
      }
    },
    onAborted: () => {
      console.log('Stream aborted');
    }
  });

  try {
    await ky.post(options.endpoint, {
      json: {
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        enable_thinking: false
      },
      headers: {
        'X-App-Id': options.apiId,
        'Content-Type': 'application/json'
      },
      signal,
      hooks: {
        afterResponse: [sseHook]
      }
    });
  }
  catch (error) {
    if (!signal?.aborted) {
      onError(error as Error);
    }
  }
};

// 碎念小栈专用：生成四种风格的回应
export interface ShredResponse {
  darkCheer: string;
  toxicSoup: string;
  microStory: string;
  deepQuote: string;
}

export const generateShredResponses = async (
  userInput: string,
  onProgress?: (responses: Partial<ShredResponse>) => void
): Promise<ShredResponse> => {
  const APP_ID = import.meta.env.VITE_APP_ID;
  const endpoint = 'https://api-integrations.appmiaoda.com/app-8911ypcw3oqp/api-2bk93oeO9NlE/v2/chat/completions';

  const systemPrompt = `你是碎纸机里的毒舌小精灵，请把用户输入当成燃料，严格按以下JSON格式返回，不要有多余解释：
{
  "darkCheer": "越丧越燃的黑暗激励话语，30字以内",
  "toxicSoup": "一针见血的毒鸡汤现实感悟，30字以内",
  "microStory": "30字微小说，要有反转",
  "deepQuote": "假装深刻的哲理名言，30字以内"
}`;

  return new Promise((resolve, reject) => {
    let fullResponse = '';

    sendChatStream({
      endpoint,
      apiId: APP_ID,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ],
      onUpdate: (content: string) => {
        fullResponse = content;
        // 尝试解析部分响应
        try {
          const parsed = JSON.parse(content);
          onProgress?.(parsed);
        } catch {
          // 还未完成，继续等待
        }
      },
      onComplete: () => {
        try {
          const parsed = JSON.parse(fullResponse);
          resolve(parsed);
        } catch (error) {
          reject(new Error('AI返回格式错误'));
        }
      },
      onError: (error: Error) => {
        reject(error);
      }
    });
  });
};
