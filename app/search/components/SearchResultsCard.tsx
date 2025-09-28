import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchResult } from '@/lib/puzzle-types';

interface SearchResultsCardProps {
  searchResults: SearchResult | null;
}

const SearchResultsCard: React.FC<SearchResultsCardProps> = ({ searchResults }) => {
  return (
    <Card className="w-full max-w-md h-fit">
      <CardHeader>
        <CardTitle>Search Results</CardTitle>
      </CardHeader>
      <CardContent>
        {!searchResults ? (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Run a search algorithm to see results here.</p>
          </div>
        ) : (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Success:</span>
              <span className={searchResults.success ? "text-green-600" : "text-red-600"}>
                {searchResults.success ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Path Length:</span>
              <span>{searchResults.pathLength}</span>
            </div>
            <div className="flex justify-between">
              <span>Nodes Expanded:</span>
              <span>{searchResults.nodesExpanded}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{searchResults.timeElapsed}ms</span>
            </div>
            {searchResults.maxDepth && (
              <div className="flex justify-between">
                <span>Max Depth:</span>
                <span>{searchResults.maxDepth}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResultsCard;
