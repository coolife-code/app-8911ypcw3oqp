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
  originalText: string; // 保存原始输入文本，用于重新碎纸
}

// 提取JSON内容的辅助函数
const extractJSON = (text: string): string => {
  // 移除可能的markdown代码块标记
  let cleaned = text.trim();
  
  // 移除 ```json 或 ``` 开头
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/, '');
  
  // 移除 ``` 结尾
  cleaned = cleaned.replace(/\s*```\s*$/, '');
  
  // 查找第一个 { 和最后一个 }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  
  return cleaned.trim();
};

export const generateShredResponses = async (
  userInput: string,
  onProgress?: (responses: Partial<ShredResponse>) => void
): Promise<ShredResponse> => {
  const APP_ID = import.meta.env.VITE_APP_ID;
  const endpoint = 'https://api-integrations.appmiaoda.com/app-8911ypcw3oqp/api-2bk93oeO9NlE/v2/chat/completions';

  const systemPrompt = `你是碎纸机里的毒舌小精灵。用户会输入他们的心情、吐槽或碎碎念，你需要生成四种不同风格的回应。

【重要】你的回复必须是纯JSON格式，不要添加任何markdown标记（如\`\`\`json），不要添加任何解释文字，只返回JSON对象。

JSON格式要求：
{
  "darkCheer": "越丧越燃的黑暗激励话语，30-50字",
  "toxicSoup": "一针见血的毒鸡汤现实感悟，30-50字",
  "microStory": "完整的微小说故事，180-220字，要有情节、冲突和反转，像一个完整的短篇故事",
  "deepQuote": "假装深刻的哲理名言，30-50字"
}

示例：
用户输入：今天又加班到很晚，好累
你的回复：
{"darkCheer":"累？那是因为你还有被剥削的价值，恭喜！至少你还没被优化掉。","toxicSoup":"加班不会让你变强，只会让老板的车变豪。你的努力，成就的是别人的梦想。","microStory":"他每天加班到深夜，相信努力会有回报。三个月后，公司年会上，老板开着新买的保时捷到场，感谢大家的辛勤付出。他看着自己银行卡里的余额，突然明白了什么。第二天，他照常打卡上班，因为房贷还要还三十年。晚上十点，办公室依然灯火通明，他打开外卖软件，点了一份最便宜的盖浇饭。窗外的城市霓虹闪烁，他想起了曾经的梦想，笑了笑，继续敲代码。","deepQuote":"当你觉得累的时候，说明你还在向上爬。躺平的人从不喊累，因为他们已经放弃了。"}

记住：
1. 直接返回JSON对象，不要用\`\`\`包裹！
2. microStory必须是180-220字的完整故事，有情节发展和反转！`;


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
          const cleanedContent = extractJSON(content);
          const parsed = JSON.parse(cleanedContent);
          onProgress?.(parsed);
        } catch {
          // 还未完成，继续等待
        }
      },
      onComplete: () => {
        try {
          const cleanedResponse = extractJSON(fullResponse);
          console.log('清理后的响应:', cleanedResponse);
          const parsed = JSON.parse(cleanedResponse);
          
          // 验证返回的数据包含所有必需字段
          if (!parsed.darkCheer || !parsed.toxicSoup || !parsed.microStory || !parsed.deepQuote) {
            console.warn('AI返回数据不完整:', parsed);
            reject(new Error('AI返回数据不完整，请重试'));
            return;
          }
          
          resolve({
            darkCheer: parsed.darkCheer,
            toxicSoup: parsed.toxicSoup,
            microStory: parsed.microStory,
            deepQuote: parsed.deepQuote,
            originalText: userInput // 保存原始输入
          });
        } catch (error) {
          console.error('解析错误，原始响应:', fullResponse);
          console.error('错误详情:', error);
          reject(new Error(`AI返回格式错误，请重试`));
        }
      },
      onError: (error: Error) => {
        reject(error);
      }
    });
  });
};
