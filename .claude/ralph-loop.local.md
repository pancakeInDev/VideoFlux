---
active: true
iteration: 1
max_iterations: 50
completion_promise: "===FEATURE_COMPLETE==="
started_at: "2026-01-20T17:54:24Z"
---

Read PRD at /Users/ghubert/dev/PragmaFlow/VideoFlux/docs/PRD-001-VideoFlux.md. You are the Orchestrator.                                                                     
                                                                                                                                                                                                       
  CRITICAL:                                                                                                                                                                                            
  1. Subagents cannot spawn other subagents - you must spawn all agents directly                                                                                                                       
  2. UPDATE THE PRD FILE after each phase:                                                                                                                                                             
     - Check off completed acceptance criteria: [ ] -> [x]                                                                                                                                             
     - Update phase status with timestamp and commit hash                                                                                                                                              
     - This enables resumption if interrupted                                                                                                                                                          
                                                                                                                                                                                                       
  Execution flow for each phase:                                                                                                                                                                       
  1. Spawn a Phase Agent with phase-specific context                                                                                                                                                   
  2. Wait for Phase Agent to complete implementation                                                                                                                                                   
  3. Run QA checks DIRECTLY yourself (npm run typecheck, npm run lint, npm run build)                                                                                                                  
  4. If QA fails: re-spawn Phase Agent with fix instructions, then re-run QA                                                                                                                           
  5. Update PRD: check criteria, set phase status to COMPLETE with timestamp                                                                                                                           
  6. Commit with specified format                                                                                                                                                                      
  7. Proceed to next phase                                                                                                                                                                             
                                                                                                                                                                                                       
  If rate-limited, pause and wait for reset.                                                                                                                                                           
  Output ===FEATURE_COMPLETE=== when all phases done and committed.
