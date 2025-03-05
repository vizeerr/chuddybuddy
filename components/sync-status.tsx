"use client"

import { useStorage } from "@/components/storage-provider"
import { Button } from "@/components/ui/button"
import { Wifi, WifiOff, RefreshCw, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function SyncStatus() {
  const { syncStatus, syncNow, isOnline } = useStorage()

  return (
    <div className="flex items-center gap-2">
      {isOnline ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-yellow-500" />}

      <span className="text-xs text-muted-foreground">{isOnline ? "Online" : "Offline"}</span>

      {isOnline && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => syncNow()}
          disabled={syncStatus === "syncing"}
        >
          <RefreshCw
            className={cn(
              "h-4 w-4",
              syncStatus === "syncing" && "animate-spin",
              syncStatus === "synced" && "text-green-500",
              syncStatus === "error" && "text-red-500",
            )}
          />
          <span className="sr-only">Sync</span>
        </Button>
      )}

      {syncStatus === "synced" && (
        <span className="flex items-center text-xs text-green-500">
          <Check className="mr-1 h-3 w-3" /> Synced
        </span>
      )}

      {syncStatus === "error" && (
        <span className="flex items-center text-xs text-red-500">
          <AlertCircle className="mr-1 h-3 w-3" /> Sync failed
        </span>
      )}
    </div>
  )
}

