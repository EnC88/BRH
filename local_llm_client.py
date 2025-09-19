
import requests
import json
from typing import Optional

class LocalLLMClient:
    def __init__(self, model: str = "tinyllama", base_url: str = "http://localhost:11434"):
        self.model = model
        self.base_url = base_url
        self.api_url = f"{base_url}/api/generate"
    
    def generate(self, prompt: str, stream: bool = False) -> str:
        """
        Generate a response from the local LLM
        
        Args:
            prompt: The input prompt
            stream: Whether to stream the response (default: False)
        
        Returns:
            The generated response text
        """
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": stream
        }
        
        try:
            response = requests.post(self.api_url, json=payload, timeout=300)
            response.raise_for_status()
            
            if stream:
                full_response = ""
                for line in response.iter_lines():
                    if line:
                        data = json.loads(line.decode('utf-8'))
                        if 'response' in data:
                            full_response += data['response']
                            print(data['response'], end='', flush=True)
                        if data.get('done', False):
                            break
                return full_response
            else:
                data = response.json()
                return data.get('response', '')
                
        except requests.exceptions.RequestException as e:
            return f"Error connecting to Ollama: {e}"
        except json.JSONDecodeError as e:
            return f"Error parsing response: {e}"
    
    def chat(self, message: str) -> str:
        """Simple chat interface"""
        print(f"Local LLM ({self.model}):")
        response = self.generate(message, stream=True)
        print("\n")
        return response

def main():
    client = LocalLLMClient()
    print("Type 'quit' or 'exit' to stop")
    
    while True:
        try:
            user_input = input("\nYou: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'q']:
                break
            
            if not user_input:
                continue
            
            client.chat(user_input)
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    main()
