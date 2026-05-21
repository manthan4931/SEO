import time
import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

load_dotenv()

# Module-level tracking for daily/long-term exhausted models
EXHAUSTED_MODELS = set()

class RobustChatGroq(ChatGroq):
    """
    A robust subclass of ChatGroq that supports the LangChain Runnable interface (like the pipe | operator),
    implements exponential backoff retries, and handles automatic model fallback if rate limits are reached.
    """
    def invoke(self, input, config=None, **kwargs):
        global EXHAUSTED_MODELS
        
        # List of models to try in sequence
        default_models = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]
        
        # Safe attribute lookup for model_name
        primary_model = getattr(self, 'model_name', None)
        if primary_model and primary_model not in default_models:
            default_models.insert(0, primary_model)
            
        # Filter out models that are known to be exhausted today
        models = [m for m in default_models if m not in EXHAUSTED_MODELS]
        if not models:
            models = default_models
            
        last_exception = None
        for model_name in models:
            for attempt in range(3):
                try:
                    # Retrieve the api key dynamically and safely
                    api_key_obj = getattr(self, 'groq_api_key', None)
                    api_key = api_key_obj.get_secret_value() if hasattr(api_key_obj, 'get_secret_value') else api_key_obj
                    if not api_key:
                        api_key = os.getenv("GROQ_API_KEY")
                        
                    # Dynamically instantiate a standard client with the current target model
                    temp_client = ChatGroq(
                        model=model_name,
                        api_key=api_key,
                        temperature=self.temperature,
                    )
                    return temp_client.invoke(input, config=config, **kwargs)
                except Exception as e:
                    err_str = str(e)
                    last_exception = e
                    
                    # Detect long-term / daily rate limits (TPD / RPD / daily)
                    is_daily_limit = any(term in err_str.lower() for term in [
                        "tokens per day", "tpd", "requests per day", "rpd", "daily limit"
                    ])
                    
                    if is_daily_limit:
                        print(f"[RobustChatGroq] Daily limit reached for '{model_name}'. Blacklisting model for this session...")
                        EXHAUSTED_MODELS.add(model_name)
                        # Break out of the retry attempts immediately to proceed to the next model without waiting
                        break
                        
                    print(f"[RobustChatGroq] Attempt {attempt + 1} failed for model '{model_name}': {err_str}")
                    
                    if "429" in err_str or "rate limit" in err_str.lower() or "limit reached" in err_str.lower():
                        sleep_time = (attempt + 1) * 2
                        print(f"[RobustChatGroq] Rate limit hit. Sleeping for {sleep_time}s before retrying...")
                        time.sleep(sleep_time)
                    else:
                        # For general connection failures, wait briefly
                        time.sleep(1)
            
            # If the model was added to EXHAUSTED_MODELS, we skip printing standard exhaustion messages
            if model_name not in EXHAUSTED_MODELS:
                print(f"[RobustChatGroq] Model '{model_name}' exhausted/rate-limited. Falling back to next model...")
            
        if last_exception:
            raise last_exception

# Central robust instances, matching constructor signatures of standard ChatGroq
llm = RobustChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0,
)

creative_llm = RobustChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.8,
)
