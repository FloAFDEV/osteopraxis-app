import React, { Component, ErrorInfo, ReactNode } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error("❌ ErrorBoundary caught an error:", error);
		console.error("Error info:", errorInfo);
		console.error("Stack trace:", error.stack);
	}

	private handleReload = () => {
		window.location.reload();
	};

	private handleReset = () => {
		this.setState({ hasError: false, error: undefined });
	};

	public render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen flex items-center justify-center bg-background p-4">
					<Card className="w-full max-w-md">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<AlertTriangle className="h-12 w-12 text-destructive" />
							</div>
							<CardTitle>Une erreur s'est produite</CardTitle>
							<CardDescription>
								L'application a rencontré un problème inattendu.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							{this.state.error && (
								<div className="bg-muted p-3 rounded-md">
									<p className="text-sm text-muted-foreground font-mono">
										{this.state.error.message}
									</p>
								</div>
							)}

							<div className="flex flex-col gap-2">
								<Button
									onClick={this.handleReset}
									variant="default"
								>
									Réessayer
								</Button>
								<Button
									onClick={this.handleReload}
									variant="outline"
								>
									<RefreshCw className="h-4 w-4 mr-2" />
									Recharger la page
								</Button>
							</div>

							<p className="text-sm text-muted-foreground text-center">
								Si le problème persiste, contactez l'assistance
								technique.
							</p>
						</CardContent>
					</Card>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;
