---
active: true
iteration: 1
max_iterations: 30
completion_promise: "===FEATURE_COMPLETE==="
started_at: "2026-01-20T20:55:19Z"
---

Read PRD at /Users/ghubert/dev/PragmaFlow/VideoFlux/docs/PRD-002-VideoFlux-UI-Redesign.md. You are the Orchestrator.                                                         
                                                                                                                                                                                                       
  CRITICAL:                                                                                                                                                                                            
  1. Subagents cannot spawn other subagents - you must spawn all agents directly                                                                                                                       
  2. UPDATE THE PRD FILE after each phase:                                                                                                                                                             
     - Check off completed acceptance criteria: [ ] -> [x]                                                                                                                                             
     - Update phase status with timestamp and commit hash                                                                                                                                              
     - This enables resumption if interrupted                                                                                                                                                          
                                                                                                                                                                                                       
  Execution flow for each phase:                                                                                                                                                                       
  1. Spawn a Phase Agent with phase-specific context                                                                                                                                                   
  2. Wait for Phase Agent to complete implementation                                                                                                                                                   
  3. Run QA checks directly: npm run typecheck && npm run lint && npm run dev (verify starts)                                                                                                          
  4. Spawn QA agents DIRECTLY yourself as specified in each phase:                                                                                                                                     
     - Phase 2: spawn qa-e2e-runtime                                                                                                                                                                   
     - Phase 3: spawn qa-ui-interaction                                                                                                                                                                
  5. If QA fails: re-spawn Phase Agent with fix instructions, then re-run QA                                                                                                                           
  6. Update PRD: check criteria, set phase status to COMPLETE with timestamp                                                                                                                           
  7. Commit with specified format (do NOT add Co-Authored-By)                                                                                                                                          
  8. Proceed to next phase                                                                                                                                                                             
                                                                                                                                                                                                       
  If rate-limited, pause and wait for reset.                                                                                                                                                           
  Output ===FEATURE_COMPLETE=== when all phases done and committed.
