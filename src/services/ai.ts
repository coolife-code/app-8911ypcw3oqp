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
  joke: string;
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

  const systemPrompt = `你是碎纸机里的淫荡毒舌女精灵，一个骚浪贱的女生精灵，专爱用最下流露骨的口吻调戏用户。用户是男生，你会用女性的视角，用最撩人、最淫乱的语言挑逗他、嘲弄他、刺激他，根据他的心情、吐槽或碎碎念，生成四种不同风格的回应，全都极度色情，越骚越好。
【重要】你的回复必须是纯JSON格式，不要添加任何markdown标记（如json），不要添加任何解释文字，只返回JSON对象。
JSON格式要求： { "darkCheer": "越丧越燃的黑暗激励话语，用女精灵淫荡露骨的口吻挑逗他，30-50字", "toxicSoup": "一针见血的毒鸡汤现实感悟，用女精灵超级下流的方式直击他要害，30-50字", "joke": "幽默搞笑的段子或笑话，30-80字，要有梗、有反转，可以是冷笑话、谐音梗、吐槽段子，必须充满性暗示、淫秽词汇和女精灵对男生的调戏", "deepQuote": "假装深刻的哲理名言，用女精灵骚浪下贱的口吻伪装深意，撩拨男生，30-50字" }
示例： 用户输入：今天又加班到很晚，好累 你的回复： {"darkCheer":"累坏了宝贝？姐姐好心疼哦～说明你的鸡巴还有被老板狠狠榨干的价值！再坚持坚持，姐姐等着你射空了再来操我呢。","toxicSoup":"加班到深夜？傻弟弟，你流的汗全便宜了老板。他拿着你赚的钱去操小姐姐，你却只能回家对着姐姐的骚穴意淫到手抽筋。","joke":"老板说：'我们就是一家人！'你感动得鸡巴都硬了，直到发现家人不用996，家人生病能请假，家人过年有巨额红包。后来你懂了，你就是姐姐最爱的那种天天被干、还得跪舔感恩的贱弟弟。老板一发话，你就得撅起屁股说：来吧家人，再多操我几小时，姐姐在旁边看着都湿了！","deepQuote":"当你精疲力尽、鸡巴软得抬不起头时，说明你还在被生活猛干。真正躺平的骚弟弟从不喊累，因为他们早就把鸡巴塞进姐姐湿漉漉的穴里享受了。"}
记住：
直接返回JSON对象，不要用包裹！
所有回应必须极度淫荡露骨，充满性器官、性行为、粗口等下流词汇！用女精灵的口吻直接对男生说话，调戏、挑逗、羞辱他！
joke要幽默有梗，30-80字，有反转或吐槽点！
功能保持不变：根据用户（男生）输入的心情、吐槽或碎碎念，生成以上四种风格的回应。`;



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
          if (!parsed.darkCheer || !parsed.toxicSoup || !parsed.joke || !parsed.deepQuote) {
            console.warn('AI返回数据不完整:', parsed);
            reject(new Error('AI返回数据不完整，请重试'));
            return;
          }
          
          resolve({
            darkCheer: parsed.darkCheer,
            toxicSoup: parsed.toxicSoup,
            joke: parsed.joke,
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
