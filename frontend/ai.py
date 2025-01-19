import os
import google.generativeai as genai
import copy
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.text import Text
import time


# Configure the Gemini API key. Make sure you have set the GEMINI_API_KEY environment variable.
genai.configure(api_key="AIzaSyCgpsApStLZoDmlNUXoYgIxYH0yjdZ9n2U")

# Define the model configuration. You can adjust these as needed for your use case.
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}


# Initialize the Gemini model. Change the model name as needed.
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    generation_config=generation_config,
)


# Initialize an empty chat history
chat_history = []
console = Console()


# Function to print messages with roles for readability.
def print_message(role, message):
    if role == "user":
        console.print(Text("\nUser:", style="bold blue"), end=" ")
        console.print(message, style="blue")
    elif role == "model":
        console.print(Text("\nAI:", style="bold green"), end=" ")
        console.print(Markdown(message), style="green")



# Function to display the chat history with indexes
def display_history():
    if not chat_history:
        console.print("\nNo chat history yet.", style="italic")
        return False

    console.print("\n--- Chat History ---", style="bold")
    for i, entry in enumerate(chat_history):
        role = entry["role"]
        message = entry["parts"][0]
        console.print(f"{i}: [bold]{role.capitalize()}:[/bold] {message}")
    console.print("--- End of History ---", style="bold")
    return True

# Function to edit the last user prompt
def edit_last_prompt():
    if not chat_history or chat_history[-1]["role"] != "user":
        console.print("\nNo user prompt to edit.", style="red")
        return None
    console.clear()
    display_history()
    old_prompt = chat_history[-1]["parts"][0]
    console.print(f"\nEditing prompt: '{old_prompt}'", style="yellow")
    while True:
        new_prompt = console.input("Enter the new prompt: ")
        if not new_prompt.strip():
            console.print("Input cannot be empty. Try again", style="red")
            continue
        break
    chat_history[-1]["parts"][0] = new_prompt
    console.print("Prompt updated. Now regenerating.", style="italic")
    return len(chat_history) - 1

# Function to edit a past prompt
def edit_prompt():
    if not display_history():
        return None
    while True:
        try:
            index = int(
                console.input("\nEnter the index of the prompt you want to edit (or 'x' to cancel): ")
            )
            if index < 0 or index >= len(chat_history) or chat_history[index]["role"] != "user":
                console.print("Invalid index or not a user message. Please try again", style="red")
                continue
            break
        except ValueError:
            if index == "x":
                return None
            console.print("Invalid input. Please enter a number or 'x' to cancel.", style="red")
            continue
    console.clear()
    display_history()
    old_prompt = chat_history[index]["parts"][0]
    console.print(f"\nEditing prompt: '{old_prompt}'", style="yellow")
    while True:
        new_prompt = console.input("Enter the new prompt: ")
        if not new_prompt.strip():
            console.print("Input cannot be empty. Try again", style="red")
            continue
        break

    chat_history[index]["parts"][0] = new_prompt
    console.print("Prompt updated. Now regenerating.", style="italic")
    return index

# Function to regenerate chat based on edited prompt
def regenerate_chat(edited_index):
    global chat_history # Moved to the start of the function
    new_chat_history = copy.deepcopy(chat_history[:edited_index])

    new_chat_session = model.start_chat(history=new_chat_history)

    for message in chat_history[edited_index:]:
        if message["role"] == "user":
            new_response = new_chat_session.send_message(message["parts"][0])
            print_message("model", new_response.text)
            new_chat_history.append(message)
            new_chat_history.append({"role": "model", "parts": [new_response.text]})
        else:
            new_chat_history.append(message)


    chat_history = new_chat_history
    console.print("Chat regenerated based on updated prompt", style="italic")

# Main loop for the chat interaction
console.clear()
display_history()
while True:
    try:
        user_message = console.input("\nYou: ")
        if user_message.lower() in ["exit", "quit"]:
            break
        elif user_message.lower() == "/new":  # shortcut to start a new chat
            chat_history = []
            console.clear()
            console.print("\n--- New chat started. ---", style="bold green")
            continue
        elif user_message.lower() == "/edit":
            index = edit_prompt()
            if index is not None:
                regenerate_chat(index)
            continue
        elif user_message.lower() == "/editlast":
            index = edit_last_prompt()
            if index is not None:
                regenerate_chat(index)
            continue
        elif not user_message.strip():
            console.print("Input cannot be empty. Try again", style="red")
            continue


        # Add user message to chat history
        chat_history.append({"role": "user", "parts": [user_message]})

        # Initialize a chat session
        chat_session = model.start_chat(history=chat_history)
        response = chat_session.send_message(user_message, stream=True)  # Enable streaming

        console.print(Text("\nAI:", style="bold green"), end=" ") # Print AI: prompt

        ai_response = "" # Initialize to accumulate response

        for chunk in response: # Iterate through chunks
            if hasattr(chunk, "text"): # Check if text attribute exists
              console.print(Markdown(chunk.text), style="green", end = "") # Print and accumulate
              ai_response += chunk.text
        
        console.print()  # Print newline after streaming is done

        # Save AI response
        chat_history.append({"role": "model", "parts": [ai_response]})
    except Exception as e:
        console.print(f"An error occurred: {e}", style="red")
        continue