package main

import (
	"log"
	"net/http"

	"perisai/service/internal/config"
	api "perisai/service/internal/http"
	"perisai/service/internal/upstream"
)

func main() {
	cfg := config.Load()
	srv := api.New(cfg, upstream.New(cfg))
	addr := ":" + cfg.Port
	log.Printf("perisai decision service on %s (mock=%v, upstream=%s)", addr, cfg.UseMock, cfg.UpstreamBase)
	if err := http.ListenAndServe(addr, srv.Handler()); err != nil {
		log.Fatal(err)
	}
}
