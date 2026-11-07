use std::sync::Arc;
use std::sync::Mutex;
use std::time::Duration;
use tauri::Manager;
use tauri::RunEvent;
use tauri::WindowEvent;
use tauri_plugin_http::reqwest;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::{process::CommandChild, ShellExt};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 🏗️ Build the app first
    let app = tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // --- Start your sidecar ---
            let sidecar_command = app.shell().sidecar("mosaik").unwrap();

            let (mut rx, sidecar_child) = sidecar_command.spawn().expect("Failed to spawn sidecar");
            let child = Arc::new(Mutex::new(Some(sidecar_child)));

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => {
                            log::info!("{}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Stderr(line) => {
                            log::error!("{}", String::from_utf8_lossy(&line));
                        }
                        CommandEvent::Error(err) => eprintln!("Error: {}", err),
                        CommandEvent::Terminated(payload) => {
                            // Use {:?} since TerminatedPayload doesn’t implement Display
                            log::info!("Sidecar exited with payload: {:?}", payload);
                            break;
                        }
                        _ => {}
                    }
                }
            });
            // store in state so we can access it on exit
            app.manage(Arc::clone(&child));

            // --- Wait until backend is ready ---
            tauri::async_runtime::block_on(async {
                let client = reqwest::Client::new();
                let url = "http://localhost:3000/api/health";
                let mut attempts = 0;
                let max_attempts = 30;

                while attempts < max_attempts {
                    match client.get(url).send().await {
                        Ok(response) if response.status().is_success() => {
                            println!("Backend is ready!");
                            break;
                        }
                        Ok(response) => {
                            println!(
                                "Backend not ready yet, status: {}. Retrying...",
                                response.status()
                            );
                        }
                        Err(err) => {
                            println!("Error connecting to backend: {err}. Retrying...");
                        }
                    }

                    attempts += 1;
                    std::thread::sleep(Duration::from_secs(1));
                }

                if attempts == max_attempts {
                    eprintln!(
                        "Backend did not become ready after {} attempts",
                        max_attempts
                    );
                }
            });

            Ok(())
        })
        // 👇 Build instead of run
        .build(tauri::generate_context!())
        .expect("error while building tauri application");

    // 🧩 Now attach global event handler and run
    app.run(|app_handle, event| match event {
        RunEvent::ExitRequested { .. } | RunEvent::Exit => {
            if let Some(child_arc) = app_handle.try_state::<Arc<Mutex<Option<CommandChild>>>>() {
                let mut lock = child_arc.lock().unwrap();
                if let Some(mut child) = lock.take() {
                    let _ = child.write(b"Exit message from Rust\n");
                    if let Err(e) = child.kill() {
                        eprintln!("Failed to kill child process: {}", e);
                    } else {
                        println!("Child process killed cleanly.");
                    }
                }
            }
        }
        RunEvent::WindowEvent { label, event, .. } => {
            if let WindowEvent::CloseRequested { .. } = event {
                println!("Window {label} close requested.");
            }
        }
        _ => {}
    });
}
